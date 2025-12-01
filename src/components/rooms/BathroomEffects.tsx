'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

interface BathroomEffectsProps {
  position: [number, number, number];
}

export const BathroomEffects = ({ position }: BathroomEffectsProps) => {
  const steamRef = useRef<THREE.Group>(null);
  const waterDropsRef = useRef<THREE.Group>(null);

  // Steam particles for shower
  const steamParticles = useMemo(() => {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        id: i,
        position: [
          Math.random() * 0.6 - 0.3,
          Math.random() * 0.5,
          Math.random() * 0.6 - 0.3
        ] as [number, number, number],
        speed: Math.random() * 0.01 + 0.005,
        opacity: Math.random() * 0.3 + 0.1
      });
    }
    return particles;
  }, []);

  // Water drops for shower
  const waterDrops = useMemo(() => {
    const drops = [];
    for (let i = 0; i < 8; i++) {
      drops.push({
        id: i,
        position: [
          Math.random() * 0.4 - 0.2,
          2.2 + Math.random() * 0.3,
          Math.random() * 0.4 - 0.2
        ] as [number, number, number],
        speed: Math.random() * 0.02 + 0.01
      });
    }
    return drops;
  }, []);

  useFrame((state) => {
    // Animate steam particles
    if (steamRef.current) {
      steamRef.current.children.forEach((child, index) => {
        const particle = steamParticles[index];
        if (child.position.y > 2.5) {
          child.position.y = 0.1;
          child.position.x = Math.random() * 0.6 - 0.3;
          child.position.z = Math.random() * 0.6 - 0.3;
        } else {
          child.position.y += particle.speed;
          child.position.x += Math.sin(state.clock.elapsedTime + index) * 0.001;
        }
      });
    }

    // Animate water drops
    if (waterDropsRef.current) {
      waterDropsRef.current.children.forEach((child, index) => {
        const drop = waterDrops[index];
        if (child.position.y < 0.1) {
          child.position.y = 2.2 + Math.random() * 0.3;
          child.position.x = Math.random() * 0.4 - 0.2;
          child.position.z = Math.random() * 0.4 - 0.2;
        } else {
          child.position.y -= drop.speed;
        }
      });
    }
  });

  return (
    <group position={position}>
      {/* Steam effect in shower area */}
      <group ref={steamRef} position={[-1.8, 0, -2]}>
        {steamParticles.map((particle) => (
          <Sphere key={particle.id} args={[0.02]} position={particle.position}>
            <meshStandardMaterial 
              color="#F0F8FF" 
              transparent 
              opacity={particle.opacity}
              emissive="#E6F3FF"
              emissiveIntensity={0.1}
            />
          </Sphere>
        ))}
      </group>

      {/* Water drops effect */}
      <group ref={waterDropsRef} position={[-1.8, 0, -2]}>
        {waterDrops.map((drop) => (
          <Sphere key={drop.id} args={[0.005]} position={drop.position}>
            <meshStandardMaterial 
              color="#87CEEB" 
              transparent 
              opacity={0.8}
              metalness={0.1}
              roughness={0.1}
            />
          </Sphere>
        ))}
      </group>

      {/* Mirror reflection effect */}
      <Box 
        args={[1.8, 0.8, 0.001]} 
        position={[-1.1, 1.7, -2.52]}
      >
        <meshStandardMaterial 
          color="#E8E8E8" 
          roughness={0.01} 
          metalness={0.95}
          transparent
          opacity={0.9}
        />
      </Box>

      {/* Ambient lighting for bathroom atmosphere */}
      <pointLight 
        position={[-1.25, 2.5, -1.5]} 
        intensity={0.3} 
        color="#E6F3FF"
        distance={3}
        decay={2}
      />

      {/* Soft glow from LED strip */}
      <Box 
        args={[1.8, 0.05, 0.02]} 
        position={[-1.1, 1.25, -2.52]}
      >
        <meshStandardMaterial 
          color="#FFFACD" 
          emissive="#FFFACD" 
          emissiveIntensity={0.4}
          transparent
          opacity={0.6}
        />
      </Box>
    </group>
  );
};