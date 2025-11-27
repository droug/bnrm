import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Html } from '@react-three/drei';
import { useRef, useState, Suspense } from 'react';
import * as THREE from 'three';

interface Book3DProps {
  coverImage: string;
  title: string;
  description: string;
  number: string;
  onClick?: () => void;
}

function BookMesh({ coverImage, title, description, number, onClick }: Book3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const texture = useTexture(coverImage);
  
  useFrame((state) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);

  return (
    <group 
      ref={meshRef} 
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={onClick}
    >
      {/* Book Cover Front */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[2.5, 3.5, 0.05]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Book Back Cover */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[2.5, 3.5, 0.05]} />
        <meshStandardMaterial color="#5a3921" />
      </mesh>

      {/* Book Spine */}
      <mesh position={[-1.275, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.2, 3.5, 0.05]} />
        <meshStandardMaterial color="#4a2f1a" />
      </mesh>

      {/* Book Pages */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.45, 3.45, 0.2]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.8} />
      </mesh>

      {/* Number Badge - Octagon */}
      <group position={[0.9, 1.4, 0.25]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 8]} />
          <meshStandardMaterial 
            color="#0066cc" 
            emissive="#0044aa" 
            emissiveIntensity={0.6}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        <Html
          position={[0, 0, 0.06]}
          center
          distanceFactor={0.7}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            className="text-white font-extrabold"
            style={{
              fontSize: '110px',
              textShadow: '0 2px 4px rgba(0,0,0,0.95)',
            }}
          >
            {number}
          </div>
        </Html>
      </group>
      
      {/* Title text directly on book cover */}
      <Html
        position={[0, 0.5, 0.25]}
        distanceFactor={0.6}
        transform
        occlude
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div style={{ width: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h3
            className="text-white font-extrabold text-center drop-shadow-2xl leading-tight"
            style={{
              fontSize: '90px',
              transform: 'scale(2)',
            }}
          >
            {title}
          </h3>
        </div>
      </Html>
    </group>
  );
}

export function Book3D({ coverImage, title, description, number, onClick }: Book3DProps) {
  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-lg">Chargement du livre 3D...</div>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={0.5} />
          <pointLight position={[0, 0, 5]} intensity={0.5} />

          <BookMesh 
            coverImage={coverImage}
            title={title}
            description={description}
            number={number}
            onClick={onClick}
          />

          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={8}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
