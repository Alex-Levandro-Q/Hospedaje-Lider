'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiUsers, FiClock } from 'react-icons/fi';
import { TimeSelector } from '../ui/TimeSelector';
import { getAuthCookies } from '@/utils/auth';
import Swal from 'sweetalert2';

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  numeroCarnet: string;
}

interface Habitacion {
  id: number;
  codigo: string;
  nombre: string;
  precioHora?: number;
  precioNoche?: number;
  precioMes?: number;
  horasMinimas?: number;
  cantidadPersonas: number;
  horarioSugerido?: {
    inicio: string;
    fin: string;
  };
}

interface AdminReservationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminReservationModal({ onClose, onSuccess }: AdminReservationModalProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [usuarioId, setUsuarioId] = useState('');
  const [habitacionId, setHabitacionId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoReserva, setTipoReserva] = useState('noche');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [cantidadPersonas, setCantidadPersonas] = useState('1');
  const [horarioSugerido, setHorarioSugerido] = useState<{inicio: string; fin: string} | null>(null);
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [habitacionSearch, setHabitacionSearch] = useState('');
  const [showUsuarioDropdown, setShowUsuarioDropdown] = useState(false);
  const [showHabitacionDropdown, setShowHabitacionDropdown] = useState(false);

  // Computed values
  const selectedHabitacion = Array.isArray(habitaciones) ? habitaciones.find(h => h.id === parseInt(habitacionId)) : null;
  const filteredUsuarios = Array.isArray(usuarios) ? usuarios.filter(u => 
    `${u.nombre} ${u.apellidos} ${u.numeroCarnet}`.toLowerCase().includes(usuarioSearch.toLowerCase())
  ) : [];
  const filteredHabitaciones = Array.isArray(habitaciones) ? habitaciones.filter(h => 
    `${h.codigo} ${h.nombre}`.toLowerCase().includes(habitacionSearch.toLowerCase())
  ) : [];

  useEffect(() => {
    fetchUsuarios();
    fetchHabitaciones();
    
    // Inicializar fechas con hoy
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    setFechaInicio(today);
    setFechaFin(today);
  }, []);

  // Auto-ajustar fecha de salida para reservas por horas
  useEffect(() => {
    if (tipoReserva === 'hora') {
      setFechaFin(fechaInicio);
    }
  }, [tipoReserva, fechaInicio]);

  // Obtener horarios sugeridos cuando se selecciona habitación
  useEffect(() => {
    if (habitacionId && fechaInicio && tipoReserva === 'hora') {
      fetchHorarioSugerido();
    }
  }, [habitacionId, fechaInicio, tipoReserva]);

  // Ajustar cantidad de personas según habitación
  useEffect(() => {
    if (selectedHabitacion) {
      setCantidadPersonas(Math.min(parseInt(cantidadPersonas), selectedHabitacion.cantidadPersonas).toString());
    }
  }, [selectedHabitacion]);

  const fetchUsuarios = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const fetchHabitaciones = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/habitaciones?activa=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHabitaciones(data);
      }
    } catch (error) {
      console.error('Error al cargar habitaciones:', error);
    }
  };

  const fetchHorarioSugerido = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch(`/api/habitaciones/${habitacionId}/horarios-sugeridos?fecha=${fechaInicio}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.horarioSugerido) {
          setHorarioSugerido(data.horarioSugerido);
          setHoraInicio(data.horarioSugerido.inicio);
          setHoraFin(data.horarioSugerido.fin);
        }
      }
    } catch (error) {
      console.error('Error al cargar horarios sugeridos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usuarioId || !habitacionId || !fechaInicio || !fechaFin) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Completa todos los campos requeridos'
      });
      return;
    }

    // Validar fechas no sean del pasado
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    if (fechaInicio < todayStr || fechaFin < todayStr) {
      Swal.fire({
        icon: 'error',
        title: 'Fechas inválidas',
        text: 'No puedes seleccionar fechas anteriores a hoy'
      });
      return;
    }

    // Validar duración mínima para reservas por horas
    if (tipoReserva === 'hora' && selectedHabitacion) {
      const inicio = new Date(`2000-01-01T${horaInicio}`);
      const fin = new Date(`2000-01-01T${horaFin}`);
      const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
      const minHoras = selectedHabitacion.horasMinimas || 3;
      
      if (horas < minHoras) {
        Swal.fire({
          icon: 'error',
          title: 'Duración insuficiente',
          text: `La duración mínima es de ${minHoras} horas`
        });
        return;
      }
    }

    setLoading(true);
    try {
      const { token } = getAuthCookies();
      const reservaData: any = {
        usuarioId: parseInt(usuarioId),
        habitacionId: parseInt(habitacionId),
        fechaInicio,
        fechaFin,
        tipoReserva,
        cantidadPersonas: parseInt(cantidadPersonas),
        comprobante: 'admin-created'
      };

      if (tipoReserva === 'hora') {
        reservaData.horaInicio = horaInicio;
        reservaData.horaFin = horaFin;
      }

      const response = await fetch('/api/reservas/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reservaData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Reserva creada!',
          timer: 1500,
          showConfirmButton: false
        });
        onSuccess();
      } else {
        const error = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error || 'Error al crear la reserva'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión'
      });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowUsuarioDropdown(false);
          setShowHabitacionDropdown(false);
        }
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Nueva Reserva</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <input
              type="text"
              value={usuarioSearch}
              onChange={(e) => {
                setUsuarioSearch(e.target.value);
                setShowUsuarioDropdown(true);
                if (!e.target.value) setUsuarioId('');
              }}
              onFocus={() => setShowUsuarioDropdown(true)}
              placeholder="Buscar cliente por nombre o CI..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            {showUsuarioDropdown && filteredUsuarios.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredUsuarios.map(usuario => (
                  <div
                    key={usuario.id}
                    onClick={() => {
                      setUsuarioId(usuario.id.toString());
                      setUsuarioSearch(`${usuario.nombre} ${usuario.apellidos} - CI: ${usuario.numeroCarnet}`);
                      setShowUsuarioDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {usuario.nombre} {usuario.apellidos} - CI: {usuario.numeroCarnet}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habitación */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habitación *
            </label>
            <input
              type="text"
              value={habitacionSearch}
              onChange={(e) => {
                setHabitacionSearch(e.target.value);
                setShowHabitacionDropdown(true);
                if (!e.target.value) setHabitacionId('');
              }}
              onFocus={() => setShowHabitacionDropdown(true)}
              placeholder="Buscar habitación por código o nombre..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            {showHabitacionDropdown && filteredHabitaciones.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredHabitaciones.map(habitacion => (
                  <div
                    key={habitacion.id}
                    onClick={() => {
                      setHabitacionId(habitacion.id.toString());
                      setHabitacionSearch(`${habitacion.codigo} - ${habitacion.nombre}`);
                      setShowHabitacionDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="font-medium">{habitacion.codigo} - {habitacion.nombre}</div>
                    <div className="text-sm text-gray-500">Capacidad: {habitacion.cantidadPersonas} personas</div>
                  </div>
                ))}
              </div>
            )}
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

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline mr-1" />
                Fecha de entrada *
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline mr-1" />
                Fecha de salida *
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Horarios para reservas por horas */}
          {tipoReserva === 'hora' && (
            <div>
              {horarioSugerido && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✨ Horario sugerido: {horarioSugerido.inicio} - {horarioSugerido.fin}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <TimeSelector
                  label="Hora de entrada"
                  value={horaInicio}
                  onChange={(value) => {
                    setHoraInicio(value);
                    // Auto-calcular hora de salida mínima
                    if (selectedHabitacion) {
                      const [hours, minutes] = value.split(':').map(Number);
                      const inicioDate = new Date();
                      inicioDate.setHours(hours, minutes, 0, 0);
                      const minHoras = selectedHabitacion.horasMinimas || 3;
                      const finDate = new Date(inicioDate.getTime() + (minHoras * 60 * 60 * 1000));
                      const horaFinCalculada = `${finDate.getHours().toString().padStart(2, '0')}:${finDate.getMinutes().toString().padStart(2, '0')}`;
                      setHoraFin(horaFinCalculada);
                    }
                  }}
                />
                <TimeSelector
                  label="Hora de salida"
                  value={horaFin}
                  onChange={setHoraFin}
                />
              </div>
              {selectedHabitacion?.horasMinimas && (
                <p className="text-sm text-gray-600 mt-2">
                  Duración mínima: {selectedHabitacion.horasMinimas} horas
                </p>
              )}
            </div>
          )}

          {/* Cantidad de personas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiUsers className="inline mr-1" />
              Cantidad de personas
            </label>
            <select
              value={cantidadPersonas}
              onChange={(e) => setCantidadPersonas(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {Array.from({length: selectedHabitacion?.cantidadPersonas || 10}, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} persona{n > 1 ? 's' : ''}</option>
              ))}
            </select>
            {selectedHabitacion && (
              <p className="text-sm text-gray-600 mt-1">
                Capacidad máxima: {selectedHabitacion.cantidadPersonas} personas
              </p>
            )}
          </div>

          {/* Precio estimado */}
          {selectedHabitacion && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Precio estimado:</h3>
              <div className="text-sm text-gray-600">
                {tipoReserva === 'hora' && selectedHabitacion.precioHora && (
                  <p>Por hora: {selectedHabitacion.precioHora} Bs</p>
                )}
                {tipoReserva === 'noche' && selectedHabitacion.precioNoche && (
                  <p>Por noche: {selectedHabitacion.precioNoche} Bs</p>
                )}
                {tipoReserva === 'mes' && selectedHabitacion.precioMes && (
                  <p>Por mes: {selectedHabitacion.precioMes} Bs</p>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}