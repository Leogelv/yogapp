'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

interface TimerSphereProps {
  className?: string;
  isPlaying?: boolean;
  timeLeft?: number;
  totalDuration?: number;
}

export default function TimerSphereCanvas({ 
  className, 
  isPlaying = false,
  timeLeft = 0,
  totalDuration = 60
}: TimerSphereProps) {
  return (
    <div 
      className={className} 
      style={{ 
        width: '100%', 
        aspectRatio: '1/1', 
        background: 'radial-gradient(circle, rgba(20,20,25,1) 0%, rgba(10,10,15,1) 100%)',
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Canvas 
        camera={{ position: [0, 0, 3.5], fov: 65 }}
        style={{ borderRadius: '50%' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.3} />
        <TimerSphere 
          isPlaying={isPlaying} 
          timeLeft={timeLeft}
          totalDuration={totalDuration}
        />
      </Canvas>
      
      {/* Пульсирующее свечение */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '110%',
          height: '110%',
          background: `
            radial-gradient(circle, 
              rgba(99, 102, 241, 0.3) 0%, 
              rgba(168, 85, 247, 0.2) 30%, 
              rgba(236, 72, 153, 0.1) 60%, 
              transparent 80%
            )
          `,
          borderRadius: '50%',
          animation: isPlaying ? 'breathe 4s ease-in-out infinite' : 'none',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
      
      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.15);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  )
}

function TimerSphere({ 
  isPlaying,
  timeLeft,
  totalDuration
}: { 
  isPlaying?: boolean;
  timeLeft?: number;
  totalDuration?: number;
}) {
  const particlesRef = useRef<THREE.Points>(null!)
  const coreRef = useRef<THREE.Points>(null!)
  const morphTimeRef = useRef(0)
  const [lastSecond, setLastSecond] = useState(Math.floor(timeLeft || 0))
  
  // Отслеживаем изменение секунд для морфинга
  useEffect(() => {
    const currentSecond = Math.floor(timeLeft || 0)
    if (currentSecond !== lastSecond && isPlaying) {
      morphTimeRef.current = 0 // Сброс морфинга при новой секунде
      setLastSecond(currentSecond)
    }
  }, [timeLeft, lastSecond, isPlaying])

  // Основные частицы сферы
  const mainGeometry = useMemo(() => {
    const points = []
    const colors = []
    const originalPositions = []
    const morphTargets = []
    const radius = 1.3
    
    // Создаем частицы в форме сферы
    for (let i = 0; i < 4000; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      points.push(new THREE.Vector3(x, y, z))
      originalPositions.push(x, y, z)
      
      // Создаем морф-таргет (случайное смещение)
      const morphRadius = radius + (Math.random() - 0.5) * 0.5
      const morphX = morphRadius * Math.sin(phi) * Math.cos(theta)
      const morphY = morphRadius * Math.sin(phi) * Math.sin(theta)
      const morphZ = morphRadius * Math.cos(phi)
      morphTargets.push(morphX, morphY, morphZ)
      
      // Градиентные цвета от индиго к фиолетовому
      const colorValue = Math.random()
      let color = new THREE.Color()
      if (colorValue < 0.5) {
        color.setHSL(0.75, 0.7, 0.6) // Индиго
      } else {
        color.setHSL(0.83, 0.8, 0.7) // Фиолетовый
      }
      
      colors.push(color.r, color.g, color.b)
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('originalPosition', new THREE.Float32BufferAttribute(originalPositions, 3))
    geometry.setAttribute('morphTarget', new THREE.Float32BufferAttribute(morphTargets, 3))
    return geometry
  }, [])

  // Внутреннее ядро
  const coreGeometry = useMemo(() => {
    const points = []
    const colors = []
    const radius = 0.5
    
    for (let i = 0; i < 1000; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      points.push(new THREE.Vector3(x, y, z))
      
      // Яркие цвета для ядра
      const color = new THREE.Color()
      color.setHSL(0.8 + Math.random() * 0.1, 1, 0.8)
      colors.push(color.r, color.g, color.b)
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geometry
  }, [])

  // Материалы
  const mainMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.02,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    })
  }, [])

  const coreMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.025,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
  }, [])

  // Анимация
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Прогресс таймера (0 - 1)
    const progress = (totalDuration && totalDuration > 0) ? ((totalDuration - (timeLeft || 0)) / totalDuration) : 0
    
    if (particlesRef.current) {
      // Медленное вращение
      const rotationSpeed = isPlaying ? 0.001 : 0.0005
      particlesRef.current.rotation.y += rotationSpeed
      particlesRef.current.rotation.x += rotationSpeed * 0.3
      
      // Морфинг каждую секунду
      if (isPlaying) {
        morphTimeRef.current += 0.016 // ~60fps
        const morphProgress = Math.min(morphTimeRef.current * 2, 1) // Морфинг за 0.5 секунды
        
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const originalPositions = particlesRef.current.geometry.attributes.originalPosition.array as Float32Array
        const morphTargets = particlesRef.current.geometry.attributes.morphTarget.array as Float32Array
        
        // Интерполяция между оригинальной позицией и морф-таргетом
        for (let i = 0; i < positions.length; i += 3) {
          // Easing функция для плавного морфинга
          const easedProgress = 1 - Math.pow(1 - morphProgress, 3)
          
          positions[i] = originalPositions[i] + (morphTargets[i] - originalPositions[i]) * easedProgress
          positions[i + 1] = originalPositions[i + 1] + (morphTargets[i + 1] - originalPositions[i + 1]) * easedProgress
          positions[i + 2] = originalPositions[i + 2] + (morphTargets[i + 2] - originalPositions[i + 2]) * easedProgress
          
          // Добавляем волновое движение
          const waveOffset = Math.sin(time * 2 + i * 0.01) * 0.02
          positions[i] += waveOffset
          positions[i + 1] += Math.cos(time * 2 + i * 0.01) * 0.02
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true
      }
      
      // Пульсация на основе прогресса
      const pulseFactor = 1 + Math.sin(time * 2) * 0.05 + progress * 0.1
      particlesRef.current.scale.setScalar(pulseFactor)
      
      // Изменение размера частиц
      if (particlesRef.current.material instanceof THREE.PointsMaterial) {
        particlesRef.current.material.size = 0.02 + Math.sin(time) * 0.005
        particlesRef.current.material.opacity = 0.7 + progress * 0.2
      }
    }
    
    if (coreRef.current) {
      // Ядро вращается быстрее и в обратную сторону
      coreRef.current.rotation.y -= 0.003
      coreRef.current.rotation.z += 0.002
      
      // Пульсация ядра
      const coreScale = 1 + Math.sin(time * 3) * 0.1 + progress * 0.3
      coreRef.current.scale.setScalar(coreScale)
      
      // Изменение яркости ядра
      if (coreRef.current.material instanceof THREE.PointsMaterial) {
        coreRef.current.material.opacity = 0.8 + Math.sin(time * 4) * 0.2
      }
    }
  })

  return (
    <>
      {/* Основные частицы */}
      <points ref={particlesRef} geometry={mainGeometry} material={mainMaterial} />
      
      {/* Внутреннее ядро */}
      <points ref={coreRef} geometry={coreGeometry} material={coreMaterial} />
      
      {/* Динамическое освещение */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={isPlaying ? 0.4 + Math.sin(Date.now() * 0.001) * 0.2 : 0.2} 
        color="#8b5cf6" 
      />
    </>
  )
} 