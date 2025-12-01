'use client';

import { RoomViewer } from '@/components/rooms/RoomViewer';

export default function HabitacionesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Recorrido Virtual de Habitaciones
          </h1>
          <p className="text-lg text-gray-600">
            Explora nuestras habitaciones en 3D. Usa WASD para moverte dentro de cada habitación.
          </p>
        </div>
        
        <RoomViewer />
      </div>
    </div>
  );
}