'use client';

import { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';
import { getAuthCookies } from '@/utils/auth';

interface TimeSlot {
  inicio: string;
  finMinimo: string;
  finMaximo: string;
}

interface TimeSlotSuggestionsProps {
  habitacionId: number;
  fecha: string;
  onSelectSlot: (inicio: string, fin: string) => void;
}

export function TimeSlotSuggestions({ habitacionId, fecha, onSelectSlot }: TimeSlotSuggestionsProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [minHoras, setMinHoras] = useState(3);

  useEffect(() => {
    if (habitacionId && fecha) {
      fetchTimeSlots();
    }
  }, [habitacionId, fecha]);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const { token } = getAuthCookies();
      const response = await fetch(`/api/horarios/disponibles?habitacionId=${habitacionId}&fecha=${fecha}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data.horariosDisponibles || []);
        setMinHoras(data.minHoras || 3);
      } else {
        console.error('Error response:', response.status);
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="animate-pulse">Cargando horarios disponibles...</div>
      </div>
    );
  }

  if (timeSlots.length === 0 && !loading) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700 text-sm">Habitación disponible todo el día - selecciona tu horario preferido</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 p-4 rounded-lg">
      <h4 className="font-semibold text-green-800 mb-3 flex items-center">
        <FiClock className="mr-2" />
        Horarios disponibles (mínimo {minHoras}h)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {timeSlots.slice(0, 6).map((slot, index) => (
          <button
            key={index}
            onClick={() => onSelectSlot(slot.inicio, slot.finMinimo)}
            className="text-left p-2 bg-white rounded border border-green-200 hover:border-green-400 hover:bg-green-100 transition-colors text-sm"
          >
            <div className="font-medium text-green-700">
              {slot.inicio} - {slot.finMaximo}
            </div>
            <div className="text-green-600 text-xs">
              Mínimo hasta {slot.finMinimo}
            </div>
          </button>
        ))}
      </div>
      {timeSlots.length > 6 && (
        <p className="text-green-600 text-xs mt-2">
          +{timeSlots.length - 6} horarios más disponibles
        </p>
      )}
    </div>
  );
}