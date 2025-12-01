'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { RoomCard } from './RoomCard';

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

interface RoomCarouselProps {
  habitaciones: Habitacion[];
  tipoReserva: string;
  onReserve: (habitacion: Habitacion) => void;
  itemsPerPage?: number;
}

export function RoomCarousel({ habitaciones, tipoReserva, onReserve, itemsPerPage = 3 }: RoomCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  
  const totalPages = Math.ceil(habitaciones.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentHabitaciones = habitaciones.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  if (habitaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron habitaciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header con navegación */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {habitaciones.length} habitación{habitaciones.length !== 1 ? 'es' : ''} disponible{habitaciones.length !== 1 ? 's' : ''}
        </h2>
        
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FiChevronLeft size={20} />
            </button>
            
            <span className="text-sm text-gray-600">
              {currentPage + 1} de {totalPages}
            </span>
            
            <button
              onClick={nextPage}
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Grid de habitaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentHabitaciones.map(habitacion => (
          <RoomCard
            key={habitacion.id}
            habitacion={habitacion}
            tipoReserva={tipoReserva}
            onReserve={() => onReserve(habitacion)}
          />
        ))}
      </div>

      {/* Indicadores de página */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentPage ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}