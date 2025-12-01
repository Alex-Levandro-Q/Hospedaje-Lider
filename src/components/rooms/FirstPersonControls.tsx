'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FirstPersonControlsProps {
  camera: React.RefObject<THREE.PerspectiveCamera>;
  roomDimensions?: { width: number; depth: number };
}

export const FirstPersonControls = ({ camera, roomDimensions }: FirstPersonControlsProps) => {
  const { gl } = useThree();
  const moveSpeed = 0.03;
  const lookSpeed = 0.001;
  
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false
  });

  const mouse = useRef({
    x: 0,
    y: 0
  });

  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keys.current.w = true;
          break;
        case 'KeyA':
          keys.current.a = true;
          break;
        case 'KeyS':
          keys.current.s = true;
          break;
        case 'KeyD':
          keys.current.d = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keys.current.w = false;
          break;
        case 'KeyA':
          keys.current.a = false;
          break;
        case 'KeyS':
          keys.current.s = false;
          break;
        case 'KeyD':
          keys.current.d = false;
          break;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) {
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        euler.current.setFromQuaternion(camera.current!.quaternion);
        euler.current.y -= movementX * lookSpeed;
        euler.current.x -= movementY * lookSpeed;
        euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
        camera.current!.quaternion.setFromEuler(euler.current);
      }
    };

    const handleClick = () => {
      gl.domElement.requestPointerLock();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [gl, camera]);

  useFrame(() => {
    if (!camera.current) return;

    velocity.current.x -= velocity.current.x * 10.0 * 0.016;
    velocity.current.z -= velocity.current.z * 10.0 * 0.016;

    direction.current.z = Number(keys.current.w) - Number(keys.current.s);
    direction.current.x = Number(keys.current.d) - Number(keys.current.a);
    direction.current.normalize();

    if (keys.current.w || keys.current.s) {
      velocity.current.z -= direction.current.z * moveSpeed;
    }
    if (keys.current.a || keys.current.d) {
      velocity.current.x -= direction.current.x * moveSpeed;
    }

    // Apply movement relative to camera direction
    const forward = new THREE.Vector3();
    camera.current.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.current.up).normalize();

    const movement = new THREE.Vector3();
    movement.addScaledVector(forward, -velocity.current.z);
    movement.addScaledVector(right, -velocity.current.x);

    // Boundary constraints (room limits)
    const newPosition = camera.current.position.clone().add(movement);
    
    // Dynamic room boundaries
    const maxX = (roomDimensions?.width || 8) / 2 - 0.5;
    const maxZ = (roomDimensions?.depth || 10) / 2 - 0.5;
    newPosition.x = Math.max(-maxX, Math.min(maxX, newPosition.x));
    newPosition.z = Math.max(-maxZ, Math.min(maxZ, newPosition.z));
    newPosition.y = 1.7; // Fixed height

    camera.current.position.copy(newPosition);
  });

  return null;
};