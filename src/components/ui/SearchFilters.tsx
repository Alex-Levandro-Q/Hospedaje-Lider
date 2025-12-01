'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiCalendar, FiUsers, FiClock } from 'react-icons/fi';
import { TimeSelector } from './TimeSelector';
import { TimeSlotSuggestions } from './TimeSlotSuggestions';
import { getAuthCookies } from '@/utils/auth';

interface Servicio {
  id: number;
  nombre: string;
}

interface SearchFiltersProps {
  initialFechaInicio?: string;
  initialFechaFin?: string;
  initialCantidadPersonas?: string;
  initialTipoReserva?: string;
  initialHoraInicio?: string;
  initialHoraFin?: string;
  initialHabitacionId?: string;
  initialServicios?: number[];
}

export function SearchFilters({
  initialFechaInicio = '',
  initialFechaFin = '',
  initialCantidadPersonas = '1',
  initialTipoReserva = 'noche',
  initialHoraInicio = '',
  initialHoraFin = '',
  initialHabitacionId = '',
  initialServicios = []
}: SearchFiltersProps = {}) {
  const router = useRouter();
  const [fechaInicio, setFechaInicio] = useState(() => {
    if (initialFechaInicio) return initialFechaInicio;
    // Si no hay fecha inicial, usar hoy
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [fechaFin, setFechaFin] = useState(() => {
    if (initialFechaFin) return initialFechaFin;
    // Si no hay fecha final, usar hoy
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [cantidadPersonas, setCantidadPersonas] = useState(initialCantidadPersonas);
  const [tipoReserva, setTipoReserva] = useState(initialTipoReserva);
  const [horaInicio, setHoraInicio] = useState(() => {
    if (initialHoraInicio) return initialHoraInicio;
    // Obtener hora local del sistema
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const nextQuarter = Math.ceil(currentMinute / 15) * 15;
    if (nextQuarter >= 60) {
      return `${(currentHour + 1).toString().padStart(2, '0')}:00`;
    }
    return `${currentHour.toString().padStart(2, '0')}:${nextQuarter.toString().padStart(2, '0')}`;
  });
  const [horaFin, setHoraFin] = useState(() => {
    if (initialHoraFin) return initialHoraFin;
    // Obtener hora local del sistema + 3 horas
    const now = new Date();
    const finTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    return `${finTime.getHours().toString().padStart(2, '0')}:${finTime.getMinutes().toString().padStart(2, '0')}`;
  });
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<number | null>(
    initialHabitacionId ? parseInt(initialHabitacionId) : null
  );
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<number[]>(initialServicios);
  const [habitaciones, setHabitaciones] = useState<any[]>([]);

  useEffect(() => {
    fetchServicios();
    fetchHabitaciones();
  }, []);

  // Auto-calcular hora de fin cuando cambia hora de inicio
  useEffect(() => {
    if (tipoReserva === 'hora' && horaInicio) {
      const [hours, minutes] = horaInicio.split(':').map(Number);
      const inicioDate = new Date();
      inicioDate.setHours(hours, minutes, 0, 0);
      const finDate = new Date(inicioDate.getTime() + (3 * 60 * 60 * 1000));
      const horaFinCalculada = `${finDate.getHours().toString().padStart(2, '0')}:${finDate.getMinutes().toString().padStart(2, '0')}`;
      setHoraFin(horaFinCalculada);
    }
  }, [horaInicio, tipoReserva]);

  const fetchServicios = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/servicios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setServicios(data.filter((s: any) => s.activo));
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    }
  };

  const fetchHabitaciones = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/habitaciones?activa=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHabitaciones(data.filter((h: any) => h.precioHora));
      }
    } catch (error) {
      console.error('Error al cargar habitaciones:', error);
    }
  };

  const handleServicioToggle = (servicioId: number) => {
    setServiciosSeleccionados(prev => 
      prev.includes(servicioId) 
        ? prev.filter(id => id !== servicioId)
        : [...prev, servicioId]
    );
  };

  const handleSearch = () => {
    // Calcular tipo de reserva automáticamente si hay fechas
    let tipoCalculado = tipoReserva;
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const diffTime = Math.abs(fin.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        tipoCalculado = 'hora';
      } else if (diffDays >= 30) {
        tipoCalculado = 'mes';
      } else {
        tipoCalculado = 'noche';
      }
    }
    
    const params = new URLSearchParams({
      fechaInicio,
      fechaFin,
      cantidadPersonas,
      tipoReserva: tipoCalculado,
      servicios: serviciosSeleccionados.join(',')
    });
    
    if (tipoCalculado === 'hora') {
      params.append('horaInicio', horaInicio);
      params.append('horaFin', horaFin);
    }
    
    if (habitacionSeleccionada) {
      params.append('habitacionId', habitacionSeleccionada.toString());
    }
    
    router.push(`/reservar?${params.toString()}`);
  };

  const today = (() => {
    // Usar fecha local del sistema para el input HTML
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  return (
    <section className="py-12 bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Encuentra tu habitación ideal
          </h2>
          <p className="text-gray-600">Filtra por fechas, huéspedes y servicios</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Fechas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline mr-1" />
                Fecha de entrada
              </label>
              <input
                type="date"
                value={fechaInicio}
                min={today}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline mr-1" />
                Fecha de salida
              </label>
              <input
                type="date"
                value={fechaFin}
                min={fechaInicio || today}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Huéspedes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUsers className="inline mr-1" />
                Huéspedes
              </label>
              <select
                value={cantidadPersonas}
                onChange={(e) => setCantidadPersonas(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1,2,3,4,5,6,8,10].map(n => (
                  <option key={n} value={n}>{n} persona{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Tipo de reserva */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiClock className="inline mr-1" />
                Tipo de estadía
              </label>
              <select
                value={tipoReserva}
                onChange={(e) => setTipoReserva(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hora">Por horas</option>
                <option value="noche">Por noche</option>
                <option value="mes">Por mes</option>
              </select>
            </div>
          </div>

          {/* Selección de habitación para reservas por horas */}
          {tipoReserva === 'hora' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Habitación (para ver horarios disponibles)
              </label>
              <select
                value={habitacionSeleccionada || ''}
                onChange={(e) => setHabitacionSeleccionada(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="">Selecciona una habitación</option>
                {habitaciones.map(h => (
                  <option key={h.id} value={h.id}>{h.codigo} - {h.nombre}</option>
                ))}
              </select>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <TimeSelector
                  label="Hora de entrada"
                  value={horaInicio}
                  onChange={setHoraInicio}
                />
                <TimeSelector
                  label="Hora de salida"
                  value={horaFin}
                  onChange={setHoraFin}
                />
              </div>
              
              {habitacionSeleccionada && fechaInicio && (
                <TimeSlotSuggestions
                  habitacionId={habitacionSeleccionada}
                  fecha={fechaInicio}
                  onSelectSlot={(inicio, fin) => {
                    setHoraInicio(inicio);
                    setHoraFin(fin);
                  }}
                />
              )}
            </div>
          )}

          {/* Servicios */}
          {servicios.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Servicios deseados (opcional)
              </label>
              <div className="flex flex-wrap gap-2">
                {servicios.map(servicio => (
                  <label key={servicio.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={serviciosSeleccionados.includes(servicio.id)}
                      onChange={() => handleServicioToggle(servicio.id)}
                      className="mr-2 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{servicio.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setFechaInicio('');
                setFechaFin('');
                setCantidadPersonas('1');
                setTipoReserva('noche');
                // Obtener hora local del sistema
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const nextQuarter = Math.ceil(currentMinute / 15) * 15;
                let startTime;
                if (nextQuarter >= 60) {
                  startTime = `${(currentHour + 1).toString().padStart(2, '0')}:00`;
                } else {
                  startTime = `${currentHour.toString().padStart(2, '0')}:${nextQuarter.toString().padStart(2, '0')}`;
                }
                const endTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
                setHoraInicio(startTime);
                setHoraFin(`${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`);
                setHabitacionSeleccionada(null);
                setServiciosSeleccionados([]);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-heading font-semibold transition-all duration-300"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={handleSearch}
              disabled={false}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-md font-heading font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FiSearch size={20} />
              Buscar habitaciones
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}