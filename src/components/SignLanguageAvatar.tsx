import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

interface SignLanguageAvatarProps {
  isActive: boolean;
  currentText?: string;
  language: string;
}

// Composant pour le corps de l'avatar
const AvatarBody: React.FC<{ isActive: boolean; gesture: string }> = ({ isActive, gesture }) => {
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!isActive) return;

    const time = state.clock.getElapsedTime();
    
    // Animation de respiration légère
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(time * 2) * 0.02;
    }

    // Animation de la tête (léger balancement)
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    }

    // Animations des bras selon le geste
    if (leftArmRef.current && rightArmRef.current) {
      switch (gesture) {
        case 'greeting':
          rightArmRef.current.rotation.z = -Math.PI / 3 + Math.sin(time * 4) * 0.2;
          leftArmRef.current.rotation.z = Math.PI / 6;
          break;
        case 'thinking':
          rightArmRef.current.rotation.z = -Math.PI / 4;
          rightArmRef.current.position.x = 0.3;
          leftArmRef.current.rotation.z = Math.PI / 4;
          break;
        case 'explaining':
          rightArmRef.current.rotation.z = -Math.PI / 6 + Math.sin(time * 2) * 0.15;
          leftArmRef.current.rotation.z = Math.PI / 6 + Math.cos(time * 2) * 0.15;
          break;
        default:
          rightArmRef.current.rotation.z = -Math.PI / 8;
          leftArmRef.current.rotation.z = Math.PI / 8;
      }
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Corps */}
      <mesh ref={bodyRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1.2, 8]} />
        <meshStandardMaterial color="#4A90E2" />
      </mesh>

      {/* Tête */}
      <mesh ref={headRef} position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#FFE4B5" />
      </mesh>

      {/* Yeux */}
      <mesh position={[-0.1, 0.95, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      <mesh position={[0.1, 0.95, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>

      {/* Bras gauche */}
      <mesh ref={leftArmRef} position={[-0.4, 0.3, 0]} rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#FFE4B5" />
      </mesh>

      {/* Bras droit */}
      <mesh ref={rightArmRef} position={[0.4, 0.3, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#FFE4B5" />
      </mesh>

      {/* Mains */}
      <mesh position={[-0.7, -0.1, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#FFE4B5" />
      </mesh>
      <mesh position={[0.7, -0.1, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#FFE4B5" />
      </mesh>
    </group>
  );
};

// Composant pour les effets de particules
const ParticleEffect: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!isActive || !particlesRef.current) return;
    
    const time = state.clock.getElapsedTime();
    particlesRef.current.rotation.y = time * 0.1;
    
    // Animation des particules
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + i) * 0.001;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!isActive) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles}
          count={particles.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#4A90E2" transparent opacity={0.6} />
    </points>
  );
};

const SignLanguageAvatar: React.FC<SignLanguageAvatarProps> = ({ 
  isActive, 
  currentText = '', 
  language 
}) => {
  const [currentGesture, setCurrentGesture] = useState<string>('idle');

  useEffect(() => {
    if (!isActive || !currentText) {
      setCurrentGesture('idle');
      return;
    }

    // Détection de gestes basée sur le contenu du texte
    const text = currentText.toLowerCase();
    
    if (text.includes('bonjour') || text.includes('salut') || text.includes('hello') || text.includes('مرحبا')) {
      setCurrentGesture('greeting');
    } else if (text.includes('réfléchi') || text.includes('pense') || text.includes('think')) {
      setCurrentGesture('thinking');
    } else if (text.length > 50) {
      setCurrentGesture('explaining');
    } else {
      setCurrentGesture('idle');
    }
  }, [currentText, isActive]);

  return (
    <div className="w-full h-64 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden relative">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Éclairage */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.3} />

        {/* Avatar 3D */}
        <AvatarBody isActive={isActive} gesture={currentGesture} />
        
        {/* Effets de particules */}
        <ParticleEffect isActive={isActive} />

        {/* Texte 3D pour indiquer le mode langue des signes */}
        {isActive && (
          <Text
            position={[0, -1.8, 0]}
            fontSize={0.15}
            color="#2C3E50"
            anchorX="center"
            anchorY="middle"
            font="/fonts/roboto-regular.woff"
          >
            {language === 'ar' ? 'لغة الإشارة' : 
             language === 'fr' ? 'Langue des signes' : 
             language === 'en' ? 'Sign Language' : 
             'Langue des signes'}
          </Text>
        )}

        {/* Contrôles pour permettre à l'utilisateur de tourner l'avatar */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      {/* Indicateur de statut */}
      {isActive && (
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600 font-medium">Langue des signes active</span>
        </div>
      )}

      {/* Légende des gestes */}
      {isActive && (
        <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
          Geste: {currentGesture === 'greeting' ? 'Salutation' : 
                  currentGesture === 'thinking' ? 'Réflexion' :
                  currentGesture === 'explaining' ? 'Explication' : 'Repos'}
        </div>
      )}
    </div>
  );
};

export default SignLanguageAvatar;