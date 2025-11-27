import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { useRef, useState } from 'react';
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
      <mesh position={[0.8, 1.3, 0.13]}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 8]} />
        <meshStandardMaterial color="#0066cc" emissive="#0066cc" emissiveIntensity={0.3} />
      </mesh>
      
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
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />
        <spotLight position={[-5, 5, 5]} angle={0.3} penumbra={1} intensity={0.5} />
        <pointLight position={[0, 0, 5]} intensity={0.3} />

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
      
      {/* Overlay Text */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
        <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-2xl">
          {title}
        </h3>
        <p className="text-white/90 text-lg leading-relaxed drop-shadow-lg">
          {description}
        </p>
        <div className="w-32 h-1 bg-primary/80 rounded-full mt-6" />
      </div>
    </div>
  );
}
