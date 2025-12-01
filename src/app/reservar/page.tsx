'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchFilters } from '@/components/ui/SearchFilters';
import { RoomCarousel } from '@/components/ui/RoomCarousel';
import { ReservationModal } from '@/components/ui/ReservationModal';
import { isAuthenticated } from '@/utils/auth';

interface Habitacion {
  id: number;
  codigo: string;
  nombre: string;
  precioHora?: number;
  precioNoche?: number;
  precioMes?: number;
  cantidadPersonas: number;
  imagen1?: string;
  imagen2?: string;
  imagen3?: string;
  descripcion?: string;
  servicios: Array<{
    servicio: { id: number; nombre: string; }
  }>;
  horarioSugerido?: {
    inicio: string;
    fin: string;
  };
}

function ReservarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Habitacion | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  
  const fechaInicio = searchParams.get('fechaInicio') || '';
  const fechaFin = searchParams.get('fechaFin') || '';
  const cantidadPersonas = searchParams.get('cantidadPersonas') || '1';
  const tipoReserva = searchParams.get('tipoReserva') || 'noche';
  const horaInicio = searchParams.get('horaInicio') || '';
  const horaFin = searchParams.get('horaFin') || '';
  const habitacionId = searchParams.get('habitacionId') || '';
  const servicios = searchParams.get('servicios')?.split(',').filter(Boolean).map(Number) || [];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchRooms();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [fechaInicio, fechaFin, cantidadPersonas, tipoReserva, horaInicio, horaFin, habitacionId, servicios.join(',')]);

  const searchRooms = async () => {
    setLoading(true);
    try {
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
      
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      if (cantidadPersonas) params.append('cantidadPersonas', cantidadPersonas);
      if (tipoCalculado) params.append('tipoReserva', tipoCalculado);
      if (tipoCalculado === 'hora' && horaInicio && horaFin) {
        params.append('horaInicio', horaInicio);
        params.append('horaFin', horaFin);
      }
      if (servicios.length > 0) params.append('servicios', servicios.join(','));
      if (habitacionId) params.append('habitacionId', habitacionId);

      const response = await fetch(`/api/habitaciones/disponibles?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Habitaciones disponibles:', data);
        setHabitaciones(data);
      } else {
        console.error('Error response:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error al buscar habitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserveRoom = (habitacion: Habitacion) => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/reservar');
      return;
    }
    
    setSelectedRoom(habitacion);
    setShowReservationModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">
            Reservar Habitación
          </h1>
          
          <SearchFilters 
            initialFechaInicio={fechaInicio}
            initialFechaFin={fechaFin}
            initialCantidadPersonas={cantidadPersonas}
            initialTipoReserva={tipoReserva}
            initialHoraInicio={horaInicio}
            initialHoraFin={horaFin}
            initialHabitacionId={habitacionId}
            initialServicios={servicios}
          />
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="mt-8">
              {habitaciones.length > 0 ? (
                <RoomCarousel
                  habitaciones={habitaciones}
                  tipoReserva={tipoReserva}
                  onReserve={handleReserveRoom}
                />
              ) : fechaInicio && fechaFin ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No se encontraron habitaciones disponibles para las fechas seleccionadas
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Selecciona las fechas para ver habitaciones disponibles
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      {showReservationModal && selectedRoom && (
        <ReservationModal
          habitacion={selectedRoom}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          cantidadPersonas={parseInt(cantidadPersonas)}
          tipoReserva={tipoReserva}
          serviciosSeleccionados={servicios}
          horaInicioFiltro={horaInicio}
          horaFinFiltro={horaFin}
          onClose={() => {
            setShowReservationModal(false);
            setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
}

export default function ReservarPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ReservarContent />
    </Suspense>
  );
}