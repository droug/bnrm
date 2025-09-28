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
      {/* Corps avec gradient moderne */}
      <mesh ref={bodyRef} position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.4, 1.2, 16]} />
        <meshPhongMaterial 
          color="#2563eb" 
          shininess={100}
          specular="#60a5fa"
        />
      </mesh>

      {/* Tête avec texture réaliste */}
      <mesh ref={headRef} position={[0, 0.9, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshPhongMaterial 
          color="#fbbf24" 
          shininess={50}
          specular="#fef3c7"
        />
      </mesh>

      {/* Cheveux modernes */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshPhongMaterial color="#374151" shininess={80} />
      </mesh>

      {/* Yeux plus expressifs */}
      <mesh position={[-0.08, 0.95, 0.2]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshPhongMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.08, 0.95, 0.2]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshPhongMaterial color="#1f2937" />
      </mesh>
      
      {/* Iris brillants */}
      <mesh position={[-0.08, 0.95, 0.22]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshPhongMaterial color="#3b82f6" shininess={100} />
      </mesh>
      <mesh position={[0.08, 0.95, 0.22]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshPhongMaterial color="#3b82f6" shininess={100} />
      </mesh>

      {/* Sourire */}
      <mesh position={[0, 0.85, 0.2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.06, 0.01, 8, 16, Math.PI]} />
        <meshPhongMaterial color="#dc2626" />
      </mesh>

      {/* Bras gauche amélioré */}
      <mesh ref={leftArmRef} position={[-0.4, 0.3, 0]} rotation={[0, 0, Math.PI / 8]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.8, 16]} />
        <meshPhongMaterial color="#fbbf24" shininess={50} />
      </mesh>

      {/* Bras droit amélioré */}
      <mesh ref={rightArmRef} position={[0.4, 0.3, 0]} rotation={[0, 0, -Math.PI / 8]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.8, 16]} />
        <meshPhongMaterial color="#fbbf24" shininess={50} />
      </mesh>

      {/* Mains détaillées */}
      <mesh position={[-0.7, -0.1, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhongMaterial color="#fbbf24" shininess={50} />
      </mesh>
      <mesh position={[0.7, -0.1, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhongMaterial color="#fbbf24" shininess={50} />
      </mesh>

      {/* Doigts pour plus de réalisme */}
      {[-0.7, 0.7].map((x, index) => (
        <group key={index}>
          {[0, 1, 2, 3].map((finger) => (
            <mesh 
              key={finger}
              position={[x + (finger - 1.5) * 0.02, -0.05, 0.05]}
              castShadow
            >
              <cylinderGeometry args={[0.008, 0.008, 0.08, 8]} />
              <meshPhongMaterial color="#fbbf24" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

// Composant pour les effets de particules améliorés
const ParticleEffect: React.FC<{ isActive: boolean; gesture: string }> = ({ isActive, gesture }) => {
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(100 * 3);
    const colors = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      
      // Couleurs variées selon le geste
      const color = new THREE.Color();
      if (gesture === 'greeting') {
        color.setHSL(0.6, 0.8, 0.6); // Bleu
      } else if (gesture === 'thinking') {
        color.setHSL(0.15, 0.8, 0.6); // Orange
      } else if (gesture === 'explaining') {
        color.setHSL(0.3, 0.8, 0.6); // Vert
      } else {
        color.setHSL(0.8, 0.6, 0.7); // Violet
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, [gesture]);

  useFrame((state) => {
    if (!isActive || !particlesRef.current) return;
    
    const time = state.clock.getElapsedTime();
    particlesRef.current.rotation.y = time * 0.2;
    particlesRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    
    // Animation des particules plus fluide
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time * 2 + i) * 0.002;
      positions[i] += Math.cos(time * 1.5 + i) * 0.001;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!isActive) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={particles.positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={particles.colors}
          count={particles.colors.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.04} 
        transparent 
        opacity={0.8} 
        vertexColors 
        blending={THREE.AdditiveBlending}
      />
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
    <div className="w-full h-80 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 rounded-xl overflow-hidden relative shadow-2xl border border-primary/20">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        {/* Éclairage amélioré */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#60a5fa" />
        <pointLight position={[5, -5, 5]} intensity={0.3} color="#f472b6" />
        <spotLight 
          position={[0, 10, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.5}
          castShadow
        />

        {/* Sol réfléchissant */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial 
            color="#1e293b" 
            metalness={0.8} 
            roughness={0.1}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Avatar 3D */}
        <AvatarBody isActive={isActive} gesture={currentGesture} />
        
        {/* Effets de particules */}
        <ParticleEffect isActive={isActive} gesture={currentGesture} />

        {/* Texte 3D avec style moderne */}
        {isActive && (
          <Text
            position={[0, -2, 0]}
            fontSize={0.2}
            color="#3b82f6"
            anchorX="center"
            anchorY="middle"
            font="/fonts/roboto-regular.woff"
            outlineWidth={0.01}
            outlineColor="#1e293b"
          >
            {language === 'ar' ? 'لغة الإشارة' : 
             language === 'fr' ? 'Langue des signes' : 
             language === 'en' ? 'Sign Language' : 
             'Langue des signes'}
          </Text>
        )}

        {/* Contrôles pour permettre à l'utilisateur de tourner l'avatar */}
        <OrbitControls 
          enableZoom={true}
          minDistance={2}
          maxDistance={6}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 6}
          autoRotate={isActive}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Indicateur de statut moderne */}
      {isActive && (
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full px-3 py-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          <span className="text-xs text-white font-semibold">IA Active</span>
        </div>
      )}

      {/* Légende des gestes avec style moderne */}
      {isActive && (
        <div className="absolute bottom-3 left-3 text-xs text-white bg-black/30 backdrop-blur-md px-3 py-2 rounded-full border border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <span className="font-medium">
              {currentGesture === 'greeting' ? '👋 Salutation' : 
               currentGesture === 'thinking' ? '🤔 Réflexion' :
               currentGesture === 'explaining' ? '💬 Explication' : '😊 Repos'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignLanguageAvatar;