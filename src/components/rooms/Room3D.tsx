'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Plane, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { BathroomEffects } from './BathroomEffects';

interface Room3DProps {
  roomType: {
    id: number;
    name: string;
    description: string;
    items: string[];
  };
}

export const Room3D = ({ roomType }: Room3DProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Dynamic room dimensions based on room type
  const getRoomDimensions = () => {
    const bedCount = roomType.items.filter(item => item.includes('bed')).length;
    const hasBathroom = roomType.items.includes('bathroom');
    
    let width = 6; // Base width
    let depth = 8; // Base depth
    
    // Adjust based on bed count
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
    
    // Add space for bathroom
    if (hasBathroom) {
      width += 2;
      depth += 1;
    }
    
    return { width, height: 3.2, depth };
  };
  
  const { width: roomWidth, height: roomHeight, depth: roomDepth } = getRoomDimensions();

  // Furniture components
  const Bed = ({ position, size = [2, 0.5, 1.5], color = '#8B4513', againstWall = false }: { 
    position: [number, number, number]; 
    size?: [number, number, number]; 
    color?: string;
    againstWall?: boolean;
  }) => (
    <group position={position}>
      {/* Bed frame */}
      <Box args={size} position={[0, size[1]/2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </Box>
      {/* Headboard */}
      <Box args={[size[0], 1.2, 0.15]} position={[0, 0.85, size[2]/2 - 0.075]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </Box>
      {/* Mattress */}
      <Box args={[size[0] - 0.1, 0.4, size[2] - 0.1]} position={[0, size[1] + 0.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#F8F8FF" roughness={0.9} />
      </Box>
      {/* Pillow */}
      <Box args={[0.8, 0.15, 0.5]} position={[0, size[1] + 0.45, size[2]/2 - 0.4]}>
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </Box>
      {/* Blanket */}
      <Box args={[size[0] - 0.2, 0.05, size[2] - 0.3]} position={[0, size[1] + 0.42, -0.2]}>
        <meshStandardMaterial color="#4682B4" roughness={0.6} />
      </Box>
      {/* Bed legs */}
      {[-size[0]/2 + 0.1, size[0]/2 - 0.1].map((x, i) => 
        [-size[2]/2 + 0.1, size[2]/2 - 0.1].map((z, j) => (
          <Cylinder key={`${i}-${j}`} args={[0.05, 0.05, size[1]]} position={[x, size[1]/2, z]}>
            <meshStandardMaterial color={color} roughness={0.8} />
          </Cylinder>
        ))
      )}
    </group>
  );

  const Nightstand = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
      {/* Main body */}
      <Box args={[0.6, 0.8, 0.4]} position={[0, 0.4, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.7} metalness={0.1} />
      </Box>
      {/* Drawer */}
      <Box args={[0.5, 0.15, 0.35]} position={[0, 0.5, 0.02]}>
        <meshStandardMaterial color="#A0522D" roughness={0.6} />
      </Box>
      {/* Handle */}
      <Cylinder args={[0.02, 0.02, 0.1]} rotation={[0, 0, Math.PI/2]} position={[0, 0.5, 0.22]}>
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.8} />
      </Cylinder>
      {/* Lamp */}
      <Cylinder args={[0.15, 0.1, 0.3]} position={[0, 1.05, 0]}>
        <meshStandardMaterial color="#F5F5DC" roughness={0.9} emissive="#FFFACD" emissiveIntensity={0.2} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 0.2]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#696969" roughness={0.5} metalness={0.7} />
      </Cylinder>
    </group>
  );

  const TV = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
      {/* TV Frame */}
      <Box args={[1.4, 0.8, 0.08]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#2F2F2F" roughness={0.3} metalness={0.7} />
      </Box>
      {/* TV Screen */}
      <Box args={[1.2, 0.65, 0.02]} position={[0, 0, 0.03]}>
        <meshStandardMaterial color="#000000" roughness={0.1} emissive="#001122" emissiveIntensity={0.1} />
      </Box>
      {/* TV Stand */}
      <Box args={[1.6, 0.7, 0.5]} position={[0, -0.75, 0.25]}>
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </Box>
      {/* Stand legs */}
      <Cylinder args={[0.03, 0.03, 0.3]} position={[0, -0.15, 0]}>
        <meshStandardMaterial color="#2F2F2F" roughness={0.3} metalness={0.8} />
      </Cylinder>
    </group>
  );

  const Bathroom = ({ position }: { position: [number, number, number] }) => (
    <group position={position} rotation={[0, Math.PI/2, 0]}>
      {/* Bathroom floor with ceramic tiles */}
      <Plane args={[2.5, 3]} rotation={[-Math.PI / 2, 0, 0]} position={[-1.25, 0.01, -1.5]} receiveShadow>
        <meshStandardMaterial color="#F0F8FF" roughness={0.1} metalness={0.1} />
      </Plane>
      
      {/* Tile pattern on floor */}
      {Array.from({ length: 5 }, (_, i) => 
        Array.from({ length: 6 }, (_, j) => (
          <Plane 
            key={`bathroom-tile-${i}-${j}`}
            args={[0.48, 0.48]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[i * -0.5 - 0.25, 0.002, j * 0.5 - 2.75]}
          >
            <meshStandardMaterial 
              color={(i + j) % 2 === 0 ? "#FFFFFF" : "#F8F8FF"} 
              roughness={0.05}
              metalness={0.1}
            />
          </Plane>
        ))
      )}
      
      {/* Bathroom walls with ceramic tiles */}
      {/* Front wall with door opening */}
      <Box args={[1, 3.2, 0.12]} position={[-0.5, 1.6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#E6F3FF" roughness={0.2} />
      </Box>
      <Box args={[1, 3.2, 0.12]} position={[-2, 1.6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#E6F3FF" roughness={0.2} />
      </Box>
      <Box args={[2.5, 1, 0.12]} position={[-1.25, 2.6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#E6F3FF" roughness={0.2} />
      </Box>
      {/* Back wall */}
      <Box args={[2.5, 3.2, 0.12]} position={[-1.25, 1.6, -3]} castShadow receiveShadow>
        <meshStandardMaterial color="#E6F3FF" roughness={0.2} />
      </Box>
      {/* Left wall */}
      <Box args={[0.12, 3.2, 3]} position={[-2.5, 1.6, -1.5]} castShadow receiveShadow>
        <meshStandardMaterial color="#E6F3FF" roughness={0.2} />
      </Box>
      {/* Right wall */}
      <Box args={[0.12, 3.2, 3]} position={[0, 1.6, -1.5]} castShadow receiveShadow>
        <meshStandardMaterial color="#E6F3FF" roughness={0.2} />
      </Box>
      
      {/* Wall tiles pattern */}
      {Array.from({ length: 5 }, (_, i) => 
        Array.from({ length: 6 }, (_, j) => (
          <Box 
            key={`wall-tile-${i}-${j}`}
            args={[0.45, 0.45, 0.02]} 
            position={[i * -0.5 - 0.25, j * 0.5 + 0.5, -2.94]}
          >
            <meshStandardMaterial 
              color={(i + j) % 2 === 0 ? "#FFFFFF" : "#F0F8FF"} 
              roughness={0.05}
              metalness={0.1}
            />
          </Box>
        ))
      )}
      
      {/* Bathroom door - positioned on front wall */}
      <group position={[-1.25, 0, 0.06]}>
        {/* Door frame */}
        <Box args={[0.15, 2.2, 0.1]} position={[-0.4, 1.1, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </Box>
        <Box args={[0.15, 2.2, 0.1]} position={[0.4, 1.1, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </Box>
        <Box args={[0.8, 0.15, 0.1]} position={[0, 2.2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </Box>
        {/* Door */}
        <Box args={[0.75, 2, 0.08]} position={[0, 1, -0.04]} castShadow receiveShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </Box>
        {/* Door handle */}
        <Sphere args={[0.03]} position={[0.25, 1, -0.08]} castShadow>
          <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
        </Sphere>
      </group>
      
      {/* Compact vanity on back wall */}
      <group position={[-1.5, 0, -2.94]} rotation={[0, 0, 0]}>
        {/* Vanity cabinet */}
        <Box args={[1.2, 0.85, 0.4]} position={[0, 0.425, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#2C3E50" roughness={0.3} metalness={0.1} />
        </Box>
        {/* Marble countertop */}
        <Box args={[1.3, 0.06, 0.45]} position={[0, 0.88, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#F8F8FF" roughness={0.05} metalness={0.2} />
        </Box>
        {/* Sink basin */}
        <Cylinder args={[0.18, 0.15, 0.1]} position={[0, 0.82, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.02} metalness={0.1} />
        </Cylinder>
        {/* Faucet */}
        <Cylinder args={[0.015, 0.015, 0.2]} position={[0, 1.0, -0.12]} castShadow>
          <meshStandardMaterial color="#C0C0C0" roughness={0.1} metalness={0.9} />
        </Cylinder>
        {/* Mirror */}
        <Box args={[1.0, 0.6, 0.02]} position={[0, 1.6, 0.22]} castShadow>
          <meshStandardMaterial 
            color="#F8F8FF" 
            roughness={0.01} 
            metalness={0.95}
            transparent
            opacity={0.95}
          />
        </Box>
        {/* Mirror frame */}
        <Box args={[1.1, 0.7, 0.03]} position={[0, 1.6, 0.21]} castShadow>
          <meshStandardMaterial color="#34495E" roughness={0.4} />
        </Box>
        {/* Vanity light */}
        <Cylinder args={[0.04, 0.04, 0.12]} position={[0, 2.0, -0.2]} castShadow>
          <meshStandardMaterial color="#FFFACD" emissive="#FFFACD" emissiveIntensity={0.4} />
        </Cylinder>
      </group>
      
      {/* Modern toilet */}
      <group position={[-2.2, 0, -1.5]} rotation={[0, Math.PI/2, 0]}>
        {/* Toilet base */}
        <Cylinder args={[0.22, 0.24, 0.32]} position={[0, 0.16, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.02} metalness={0.1} />
        </Cylinder>
        {/* Toilet tank */}
        <Box args={[0.4, 0.6, 0.18]} position={[0, 0.6, -0.22]} castShadow receiveShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.02} metalness={0.1} />
        </Box>
        {/* Toilet seat */}
        <Cylinder args={[0.2, 0.2, 0.03]} position={[0, 0.35, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#F8F8FF" roughness={0.1} />
        </Cylinder>
        {/* Toilet lid */}
        <Cylinder args={[0.22, 0.22, 0.02]} position={[0, 0.38, -0.05]} rotation={[-0.2, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.02} />
        </Cylinder>
        {/* Flush handle */}
        <Box args={[0.08, 0.03, 0.02]} position={[0.18, 0.7, -0.15]} castShadow>
          <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
        </Box>
      </group>
      
      {/* Enhanced corner shower */}
      <group position={[-2.4, 0, -0.3]}>
        {/* Shower base/tray with raised edges */}
        <Box args={[0.8, 0.08, 0.8]} position={[0, 0.04, 0]} receiveShadow>
          <meshStandardMaterial color="#F0F8FF" roughness={0.1} metalness={0.1} />
        </Box>
        <Box args={[0.8, 0.05, 0.05]} position={[0, 0.1, 0.375]} receiveShadow>
          <meshStandardMaterial color="#E8E8E8" roughness={0.2} />
        </Box>
        <Box args={[0.05, 0.05, 0.8]} position={[0.375, 0.1, 0]} receiveShadow>
          <meshStandardMaterial color="#E8E8E8" roughness={0.2} />
        </Box>
        {/* Shower drain */}
        <Cylinder args={[0.05, 0.05, 0.02]} position={[0, 0.09, 0]} receiveShadow>
          <meshStandardMaterial color="#808080" roughness={0.3} metalness={0.7} />
        </Cylinder>
        {/* Glass panels with frames */}
        <Box args={[0.4, 2.1, 0.02]} position={[0.19, 1.05, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#E0F6FF" transparent opacity={0.15} roughness={0.01} />
        </Box>
        <Box args={[0.02, 2.1, 0.4]} position={[0, 1.05, 0.19]} castShadow receiveShadow>
          <meshStandardMaterial color="#E0F6FF" transparent opacity={0.15} roughness={0.01} />
        </Box>
        {/* Glass frame */}
        <Box args={[0.03, 2.1, 0.03]} position={[0.19, 1.05, -0.01]} castShadow>
          <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.7} />
        </Box>
        <Box args={[0.03, 2.1, 0.03]} position={[-0.01, 1.05, 0.19]} castShadow>
          <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.7} />
        </Box>
        {/* Shower head with arm */}
        <Cylinder args={[0.08, 0.08, 0.04]} position={[0.12, 2.3, 0.12]} castShadow>
          <meshStandardMaterial color="#C0C0C0" roughness={0.1} metalness={0.9} />
        </Cylinder>
        <Cylinder args={[0.015, 0.015, 0.18]} rotation={[0, 0, -Math.PI/4]} position={[0.22, 2.2, 0.02]} castShadow>
          <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
        </Cylinder>
        {/* Wall mount */}
        <Cylinder args={[0.04, 0.04, 0.03]} position={[0.3, 2.15, -0.05]} castShadow>
          <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
        </Cylinder>

        {/* Towel hook on shower wall */}
        <Cylinder args={[0.01, 0.01, 0.08]} position={[0.35, 1.5, 0.02]} castShadow>
          <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
        </Cylinder>
      </group>
      

      
      {/* Toilet paper holder */}
      <group position={[-2.4, 0.6, -1.2]}>
        <Cylinder args={[0.01, 0.01, 0.15]} rotation={[0, 0, Math.PI/2]} castShadow>
          <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
        </Cylinder>
        <Cylinder args={[0.05, 0.05, 0.1]} rotation={[0, 0, Math.PI/2]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
        </Cylinder>
      </group>
      
      {/* Bathroom accessories on vanity */}
      {/* Soap dispenser */}
      <Cylinder args={[0.025, 0.025, 0.1]} position={[-1.3, 0.95, -2.94]} castShadow>
        <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.8} />
      </Cylinder>
      
      {/* Toothbrush holder */}
      <Cylinder args={[0.02, 0.02, 0.06]} position={[-1.7, 0.95, -2.94]} castShadow>
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
      </Cylinder>
      
      {/* Ceiling light with modern design */}
      <group position={[-1.25, 3.1, -1.5]}>
        <Cylinder args={[0.12, 0.12, 0.05]} castShadow>
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFEF7" emissiveIntensity={0.5} />
        </Cylinder>
        <Cylinder args={[0.15, 0.15, 0.02]} position={[0, -0.03, 0]} castShadow>
          <meshStandardMaterial color="#E8E8E8" roughness={0.3} />
        </Cylinder>
      </group>
      
      {/* Ventilation fan */}
      <Box args={[0.25, 0.25, 0.05]} position={[-0.5, 3.15, -1]} castShadow>
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
      </Box>
    </group>
  );

  const renderFurniture = () => {
    const furniture: JSX.Element[] = [];
    let bedCount = 0;
    let nightstandCount = 0;
    const hasBathroom = roomType.items.includes('bathroom');
    const bedItems = roomType.items.filter(item => item.includes('bed'));
    
    // Calculate positions based on room size and furniture count
    const centerX = 0;
    const centerZ = roomDepth * 0.1;
    
    roomType.items.forEach((item, index) => {
      switch (item) {
        case 'bed_single':
          let singleX = centerX;
          let singleZ = roomDepth * 0.35; // Position against back wall
          
          if (bedItems.length === 1) {
            singleX = centerX;
          } else if (bedItems.length === 2) {
            singleX = bedCount === 0 ? -roomWidth * 0.2 : roomWidth * 0.2;
          } else {
            singleX = bedCount === 0 ? -roomWidth * 0.25 : roomWidth * 0.25;
            singleZ = roomDepth * 0.3;
          }
          
          furniture.push(
            <Bed 
              key={`bed_single_${bedCount}`}
              position={[singleX, 0, singleZ]} 
              size={[1.5, 0.5, 2]}
              againstWall={true}
            />
          );
          bedCount++;
          break;
          
        case 'bed_double':
          let doubleX = centerX;
          let doubleZ = roomDepth * 0.35; // Position against back wall
          
          if (bedItems.length === 1) {
            doubleX = centerX;
          } else if (bedItems.length === 2) {
            doubleX = bedCount === 0 ? -roomWidth * 0.15 : roomWidth * 0.15;
            doubleZ = bedCount === 0 ? roomDepth * 0.35 : roomDepth * 0.1;
          } else {
            doubleX = bedCount === 0 ? -roomWidth * 0.2 : roomWidth * 0.2;
            doubleZ = bedCount === 0 ? roomDepth * 0.35 : roomDepth * 0.1;
          }
          
          furniture.push(
            <Bed 
              key={`bed_double_${bedCount}`}
              position={[doubleX, 0, doubleZ]} 
              size={[2, 0.5, 2]}
              againstWall={true}
            />
          );
          bedCount++;
          break;
          
        case 'bed_double2':
          furniture.push(
            <Bed 
              key="bed_double2"
              position={[roomWidth * 0.2, 0, roomDepth * 0.1]} 
              size={[2, 0.5, 2]}
              againstWall={true}
            />
          );
          break;
          
        case 'nightstand':
          const nsX = nightstandCount === 0 ? -roomWidth * 0.35 : roomWidth * 0.35;
          furniture.push(
            <Nightstand 
              key={`nightstand_${nightstandCount}`}
              position={[nsX, 0.4, centerZ]}
            />
          );
          nightstandCount++;
          break;
          
        case 'nightstand2':
          furniture.push(
            <Nightstand 
              key="nightstand2"
              position={[roomWidth * 0.35, 0.4, -centerZ * 0.5]}
            />
          );
          break;
          
        case 'nightstand3':
          furniture.push(
            <Nightstand 
              key="nightstand3"
              position={[-roomWidth * 0.35, 0.4, -centerZ * 0.5]}
            />
          );
          break;
          
        case 'tv':
          const tvZ = hasBathroom ? -roomDepth * 0.35 : -roomDepth * 0.45;
          furniture.push(
            <TV 
              key="tv"
              position={[0, 1.5, tvZ]}
            />
          );
          break;
          
        case 'bathroom':
          furniture.push(
            <Bathroom 
              key="bathroom"
              position={[-roomWidth/2 - 0.01, 0, -roomDepth/2 - 0.1]}
            />
          );
          break;
      }
    });

    return furniture;
  };

  return (
    <group ref={groupRef} rotation={[0, Math.PI/4, 0]}>
      {/* Floor */}
      <Plane args={[roomWidth, roomDepth]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#DEB887" roughness={0.8} />
      </Plane>
      
      {/* Floor tiles pattern */}
      {Array.from({ length: Math.floor(roomWidth) }, (_, i) => 
        Array.from({ length: Math.floor(roomDepth) }, (_, j) => (
          <Plane 
            key={`tile-${i}-${j}`}
            args={[0.95, 0.95]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[i - roomWidth/2 + 0.5, 0.001, j - roomDepth/2 + 0.5]}
          >
            <meshStandardMaterial 
              color={(i + j) % 2 === 0 ? "#F5DEB3" : "#DEB887"} 
              roughness={0.9} 
            />
          </Plane>
        ))
      )}

      {/* Walls */}
      {/* Back wall - with bathroom opening */}
      {roomType.items.includes('bathroom') ? (
        <>
          <Plane args={[roomWidth * 0.3, roomHeight]} position={[-roomWidth * 0.35, roomHeight/2, -roomDepth/2]}>
            <meshStandardMaterial color="#FFF8DC" roughness={0.9} />
          </Plane>
          <Plane args={[roomWidth * 0.3, roomHeight]} position={[roomWidth * 0.35, roomHeight/2, -roomDepth/2]}>
            <meshStandardMaterial color="#FFF8DC" roughness={0.9} />
          </Plane>
          <Plane args={[roomWidth * 0.4, 1, roomHeight]} position={[0, roomHeight - 0.5, -roomDepth/2]}>
            <meshStandardMaterial color="#FFF8DC" roughness={0.9} />
          </Plane>
        </>
      ) : (
        <Plane args={[roomWidth, roomHeight]} position={[0, roomHeight/2, -roomDepth/2]}>
          <meshStandardMaterial color="#FFF8DC" roughness={0.9} />
        </Plane>
      )}
      
      {/* Front wall */}
      <Plane args={[roomWidth, roomHeight]} position={[0, roomHeight/2, roomDepth/2]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial color="#FFF8DC" roughness={0.9} />
      </Plane>
      
      {/* Left wall */}
      <Plane args={[roomDepth, roomHeight]} position={[-roomWidth/2, roomHeight/2, 0]} rotation={[0, Math.PI/2, 0]}>
        <meshStandardMaterial color="#FFF8DC" roughness={0.9} />
      </Plane>
      
      {/* Right wall */}
      <Plane args={[roomDepth, roomHeight]} position={[roomWidth/2, roomHeight/2, 0]} rotation={[0, -Math.PI/2, 0]}>
        <meshStandardMaterial color="#FFF8DC" roughness={0.9} />
      </Plane>

      {/* Ceiling */}
      <Plane args={[roomWidth, roomDepth]} rotation={[Math.PI / 2, 0, 0]} position={[0, roomHeight, 0]}>
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </Plane>
      
      {/* Ceiling light */}
      <group position={[0, roomHeight - 0.1, 0]}>
        <Cylinder args={[0.3, 0.3, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#FFFACD" emissive="#FFFACD" emissiveIntensity={0.3} />
        </Cylinder>
      </group>

      {/* Door */}
      <group position={[roomWidth/2 - 0.05, 0, roomDepth/2 - roomDepth * 0.2]}>
        <Box args={[0.1, 2.2, 1]} position={[0, 1.1, 0]}>
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </Box>
        {/* Door handle */}
        <Sphere args={[0.05]} position={[-0.08, 1.1, 0.3]}>
          <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.8} />
        </Sphere>
        {/* Door frame */}
        <Box args={[0.15, 2.4, 0.1]} position={[0.05, 1.2, -0.55]}>
          <meshStandardMaterial color="#A0522D" roughness={0.8} />
        </Box>
        <Box args={[0.15, 2.4, 0.1]} position={[0.05, 1.2, 0.55]}>
          <meshStandardMaterial color="#A0522D" roughness={0.8} />
        </Box>
      </group>

      {/* Window */}
      <group position={[0, 2, -roomDepth/2 + 0.025]}>
        <Box args={[Math.min(roomWidth * 0.4, 2.5), 1.2, 0.05]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} roughness={0.1} />
        </Box>
        {/* Window frame */}
        <Box args={[Math.min(roomWidth * 0.4, 2.5) + 0.2, 0.1, 0.1]} position={[0, -0.65, 0]}>
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </Box>
        <Box args={[Math.min(roomWidth * 0.4, 2.5) + 0.2, 0.1, 0.1]} position={[0, 0.65, 0]}>
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </Box>
        <Box args={[0.1, 1.2, 0.1]} position={[-Math.min(roomWidth * 0.2, 1.25) - 0.1, 0, 0]}>
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </Box>
        <Box args={[0.1, 1.2, 0.1]} position={[Math.min(roomWidth * 0.2, 1.25) + 0.1, 0, 0]}>
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </Box>
      </group>

      {/* Furniture */}
      {renderFurniture()}
      
      {/* Bathroom effects */}
      {roomType.items.includes('bathroom') && (
        <BathroomEffects position={[-roomWidth/2 - 0.2, 0, -roomDepth/2 - 0.1]} />
      )}
    </group>
  );
};