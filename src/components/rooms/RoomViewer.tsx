'use client';

import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Room3D } from './Room3D';
import { FirstPersonControls } from './FirstPersonControls';

const roomTypes = [
  {
    id: 1,
    name: 'Habitación Simple',
    description: 'Cama de plaza y media, veladora',
    items: ['bed_single', 'nightstand']
  },
  {
    id: 2,
    name: 'Habitación Simple con TV',
    description: 'Cama de plaza y media, veladora y TV',
    items: ['bed_single', 'nightstand', 'tv']
  },
  {
    id: 3,
    name: 'Habitación Matrimonial',
    description: 'Cama de 2 plazas, veladora y TV',
    items: ['bed_double', 'nightstand', 'tv']
  },
  {
    id: 4,
    name: 'Habitación con Baño Privado',
    description: 'Cama de 2 plazas, veladora, TV y baño privado con ducha',
    items: ['bed_double', 'nightstand', 'tv', 'bathroom']
  },
  {
    id: 5,
    name: 'Habitación Doble',
    description: 'Cama de 2 plazas, cama de plaza y media, 2 veladoras y TV',
    items: ['bed_double', 'bed_single', 'nightstand', 'nightstand2', 'tv']
  },
  {
    id: 6,
    name: 'Habitación Doble con Baño Privado',
    description: 'Cama de 2 plazas, cama de plaza y media, 2 veladoras, TV y baño privado',
    items: ['bed_double', 'bed_single', 'nightstand', 'nightstand2', 'tv', 'bathroom']
  },
  {
    id: 7,
    name: 'Habitación Triple',
    description: '2 camas de 2 plazas, cama de plaza y media, 3 veladoras y TV',
    items: ['bed_double', 'bed_double2', 'bed_single', 'nightstand', 'nightstand2', 'nightstand3', 'tv']
  },
  {
    id: 8,
    name: 'Habitación Triple con Baño Privado',
    description: '2 camas de 2 plazas, cama de plaza y media, 3 veladoras, TV y baño privado',
    items: ['bed_double', 'bed_double2', 'bed_single', 'nightstand', 'nightstand2', 'nightstand3', 'tv', 'bathroom']
  }
];

export const RoomViewer = () => {
  const [selectedRoom, setSelectedRoom] = useState(roomTypes[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'orbit' | 'firstPerson'>('orbit');
  const cameraRef = useRef<any>();
  
  // Calculate room dimensions for current room
  const getRoomDimensions = (room: typeof roomTypes[0]) => {
    const bedCount = room.items.filter(item => item.includes('bed')).length;
    const hasBathroom = room.items.includes('bathroom');
    
    let width = 6;
    let depth = 8;
    
    if (bedCount === 1) {
      width = 5;
      depth = 7;
    } else if (bedCount === 2) {
      width = 7;
      depth = 9;
    } else if (bedCount >= 3) {
      width = 9;
      depth = 11;
    }
    
    if (hasBathroom) {
      width += 2;
      depth += 1;
    }
    
    return { width, depth };
  };
  
  const currentRoomDimensions = getRoomDimensions(selectedRoom);

  const handleRoomChange = (room: typeof roomTypes[0]) => {
    setSelectedRoom(room);
    setIsMenuOpen(false);
  };

  return (
    <div className="w-full h-screen relative">
      {/* Room Selection Menu */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:bg-white transition-colors"
        >
          📋 {selectedRoom.name}
        </button>
        
        {isMenuOpen && (
          <div className="absolute top-12 left-0 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
            <h3 className="font-bold text-lg mb-3">Seleccionar Habitación</h3>
            {roomTypes.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomChange(room)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedRoom.id === room.id 
                    ? 'bg-orange-100 border-2 border-orange-500' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-semibold">{room.name}</div>
                <div className="text-sm text-gray-600">{room.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex gap-2">
          <button
            onClick={() => setViewMode('orbit')}
            className={`px-3 py-2 rounded ${
              viewMode === 'orbit' ? 'bg-orange-500 text-white' : 'bg-gray-100'
            }`}
          >
            🔄 Vista Orbital
          </button>
          <button
            onClick={() => setViewMode('firstPerson')}
            className={`px-3 py-2 rounded ${
              viewMode === 'firstPerson' ? 'bg-orange-500 text-white' : 'bg-gray-100'
            }`}
          >
            🚶 Primera Persona
          </button>
        </div>
      </div>

      {/* Controls Info */}
      {viewMode === 'firstPerson' && (
        <div className="absolute bottom-4 left-4 z-10 bg-black/70 text-white p-4 rounded-lg">
          <div className="text-sm">
            <div className="font-bold mb-2">Controles:</div>
            <div>W - Adelante</div>
            <div>S - Atrás</div>
            <div>A - Izquierda</div>
            <div>D - Derecha</div>
            <div>Mouse - Mirar alrededor</div>
          </div>
        </div>
      )}

      {/* Room Info */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs">
        <h3 className="font-bold text-lg">{selectedRoom.name}</h3>
        <p className="text-sm text-gray-600">{selectedRoom.description}</p>
      </div>

      {/* 3D Canvas */}
      <Canvas 
        className="w-full h-full" 
        shadows
        camera={{ fov: 75, near: 0.1, far: 1000 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.8} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 2.8, 0]} intensity={0.6} color="#FFFACD" />
        <spotLight 
          position={[0, 3, 0]} 
          angle={Math.PI / 4} 
          penumbra={0.5} 
          intensity={0.5}
          castShadow
        />
        
        {/* Bathroom specific lighting */}
        {selectedRoom.items.includes('bathroom') && (
          <>
            {/* Bathroom ceiling light */}
            <pointLight 
              position={[-currentRoomDimensions.width * 0.6, 2.8, -currentRoomDimensions.depth * 0.2]} 
              intensity={0.8} 
              color="#F0F8FF" 
              castShadow
            />
            {/* Vanity lights */}
            <pointLight 
              position={[-currentRoomDimensions.width * 0.4, 2.1, -currentRoomDimensions.depth * 0.35]} 
              intensity={0.4} 
              color="#FFFACD"
            />
            <pointLight 
              position={[-currentRoomDimensions.width * 0.8, 2.1, -currentRoomDimensions.depth * 0.35]} 
              intensity={0.4} 
              color="#FFFACD"
            />
          </>
        )}
        
        {viewMode === 'orbit' ? (
          <>
            <PerspectiveCamera 
              makeDefault 
              position={[
                currentRoomDimensions.width * 0.8, 
                currentRoomDimensions.width * 0.6, 
                currentRoomDimensions.depth * 0.6
              ]} 
              fov={60} 
            />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </>
        ) : (
          <>
            <PerspectiveCamera 
              ref={cameraRef} 
              makeDefault 
              position={[0, 1.7, currentRoomDimensions.depth * 0.3]} 
              fov={75} 
            />
            <FirstPersonControls camera={cameraRef} roomDimensions={currentRoomDimensions} />
          </>
        )}
        
        <Room3D roomType={selectedRoom} />
      </Canvas>
    </div>
  );
};