'use client';

import { useState } from 'react';
import { FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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

interface RoomCardProps {
  habitacion: Habitacion;
  tipoReserva: string;
  onReserve: () => void;
}

export function RoomCard({ habitacion, tipoReserva, onReserve }: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [habitacion.imagen1, habitacion.imagen2, habitacion.imagen3].filter(Boolean);
  
  const getPrecio = () => {
    switch (tipoReserva) {
      case 'hora': return habitacion.precioHora;
      case 'noche': return habitacion.precioNoche;
      case 'mes': return habitacion.precioMes;
      default: return habitacion.precioNoche;
    }
  };

  const getTipoTexto = () => {
    switch (tipoReserva) {
      case 'hora': return 'por hora';
      case 'noche': return 'por noche';
      case 'mes': return 'por mes';
      default: return 'por noche';
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const precio = getPrecio();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        {images.length > 0 ? (
          <>
            <img 
              src={images[currentImageIndex]} 
              alt={habitacion.nombre}
              className="w-full h-48 object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                >
                  <FiChevronRight size={16} />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Sin imagen</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {habitacion.codigo} - {habitacion.nombre}
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-500">
              {precio} Bs
            </div>
            <div className="text-sm text-gray-500">
              {getTipoTexto()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <FiUsers className="mr-1" size={16} />
          <span className="text-sm">
            Hasta {habitacion.cantidadPersonas} persona{habitacion.cantidadPersonas !== 1 ? 's' : ''}
          </span>
        </div>
        
        {habitacion.descripcion && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {habitacion.descripcion}
          </p>
        )}
        
        {tipoReserva === 'hora' && habitacion.horarioSugerido && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-800 font-medium mb-1">Horario sugerido:</div>
            <div className="text-sm text-green-700">
              {habitacion.horarioSugerido.inicio} - {habitacion.horarioSugerido.fin}
            </div>
          </div>
        )}
        
        {habitacion.servicios.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-700 mb-2">Servicios incluidos:</div>
            <div className="flex flex-wrap gap-1">
              {habitacion.servicios.slice(0, 3).map(({ servicio }) => (
                <span 
                  key={servicio.id}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {servicio.nombre}
                </span>
              ))}
              {habitacion.servicios.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{habitacion.servicios.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}
        
        <button
          onClick={onReserve}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
        >
          Reservar ahora
        </button>
      </div>
    </div>
  );
}