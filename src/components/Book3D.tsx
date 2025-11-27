import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
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
      <group position={[0.8, 1.3, 0.13]}>
        {/* Octagon base */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.08, 8]} />
          <meshStandardMaterial 
            color="#0066cc" 
            emissive="#0044aa" 
            emissiveIntensity={0.6}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      </group>
      
      {/* Title overlay (simple plane for demonstration) */}
      {hovered && (
        <group position={[0, -2.5, 0.5]}>
          <mesh>
            <planeGeometry args={[3, 1.5]} />
            <meshBasicMaterial color="#000000" opacity={0.8} transparent />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function Book3D({ coverImage, title, description, number, onClick }: Book3DProps) {
  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white">Chargement...</div>
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
      
      {/* Overlay Text */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
              <polygon points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18" className="fill-primary" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-primary-foreground font-bold text-xl">
              {number}
            </div>
          </div>
          <h3 className="text-4xl font-bold text-white drop-shadow-2xl">
            {title}
          </h3>
        </div>
        <p className="text-white/90 text-lg leading-relaxed drop-shadow-lg">
          {description}
        </p>
        <div className="w-32 h-1 bg-primary/80 rounded-full mt-6" />
      </div>
    </div>
  );
}
