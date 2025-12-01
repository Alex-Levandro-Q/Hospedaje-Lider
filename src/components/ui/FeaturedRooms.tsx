'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoomCarousel } from './RoomCarousel';

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
}

export function FeaturedRooms() {
  const router = useRouter();
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedRooms();
  }, []);

  const fetchFeaturedRooms = async () => {
    try {
      const response = await fetch('/api/habitaciones/disponibles');
      if (response.ok) {
        const data = await response.json();
        // Mostrar solo las primeras 6 habitaciones
        setHabitaciones(data.slice(0, 6));
      }
    } catch (error) {
      console.error('Error al cargar habitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserveRoom = (habitacion: Habitacion) => {
    // Redirigir a la página de reservas con la habitación seleccionada
    router.push(`/reservar?habitacionId=${habitacion.id}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
              Habitaciones Destacadas
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (habitaciones.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
            Habitaciones Destacadas
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras mejores habitaciones disponibles
          </p>
        </div>
        
        <RoomCarousel
          habitaciones={habitaciones}
          tipoReserva="noche"
          onReserve={handleReserveRoom}
          itemsPerPage={3}
        />
        
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/reservar')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Ver todas las habitaciones
          </button>
        </div>
      </div>
    </section>
  );
}