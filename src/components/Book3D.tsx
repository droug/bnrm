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
  
  // Load the cover texture
  const texture = useTexture(coverImage);
  
  // Auto-rotate animation
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
      <group position={[0.9, 1.4, 0.13]}>
        {/* Octagon base - smaller */}
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
        
        {/* Number as HTML overlay on badge - larger and centered */}
        <Html
          position={[0, 0, 0.035]}
          center
          distanceFactor={0.45}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div className="text-white font-bold text-3xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {number}
          </div>
        </Html>
      </group>
      
      {/* Title text directly on book cover */}
      <Html
        position={[0, 0.8, 0.13]}
        center
        distanceFactor={0.9}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div style={{ width: '340px' }}>
          <h3 className="text-white font-bold text-3xl text-center drop-shadow-2xl leading-tight">
            {title}
          </h3>
        </div>
      </Html>
      
      {/* Description text on book cover */}
      <Html
        position={[0, -0.8, 0.13]}
        center
        distanceFactor={1}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="bg-black/70 px-6 py-4 rounded backdrop-blur-sm" style={{ width: '360px' }}>
          <p className="text-white/95 text-base text-center leading-relaxed">
            {description.substring(0, 120)}...
          </p>
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
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={0.5} />
          <pointLight position={[0, 0, 5]} intensity={0.5} />

          {/* Book */}
          <BookMesh 
            coverImage={coverImage}
            title={title}
            description={description}
            number={number}
            onClick={onClick}
          />

          {/* Controls */}
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
      
      {/* Static overlay for full description at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10">
        <p className="text-white/80 text-sm leading-relaxed drop-shadow-lg line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
}
