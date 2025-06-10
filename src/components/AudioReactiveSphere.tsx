'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

interface AudioReactiveSphereProps {
  className?: string;
  audioElement?: HTMLAudioElement | null;
  isPlaying?: boolean;
}

export default function AudioReactiveSphereCanvas({ 
  className, 
  audioElement, 
  isPlaying = false 
}: AudioReactiveSphereProps) {
  return (
    <div 
      className={className} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    >
      <Canvas 
        camera={{ position: [0, 0, 3], fov: 75 }}
        style={{ 
          width: '100%',
          height: '100%',
          background: 'transparent'
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <AudioReactiveSphere audioElement={audioElement} isPlaying={isPlaying} />
      </Canvas>
    </div>
  )
}

function AudioReactiveSphere({ 
  audioElement, 
  isPlaying 
}: { 
  audioElement?: HTMLAudioElement | null; 
  isPlaying?: boolean;
}) {
  const particlesRef = useRef<THREE.Points>(null!)
  const innerParticlesRef = useRef<THREE.Points>(null!)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null)
  
  // Создаем аудио контекст и анализатор
  useEffect(() => {
    if (audioElement && isPlaying) {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = context.createMediaElementSource(audioElement)
        const analyserNode = context.createAnalyser()
        
        // Настройки анализатора для лучшего разрешения частот
        analyserNode.fftSize = 512
        analyserNode.smoothingTimeConstant = 0.8
        
        source.connect(analyserNode)
        analyserNode.connect(context.destination)
        
        setAudioContext(context)
        setAnalyser(analyserNode)
        setFrequencyData(new Uint8Array(analyserNode.frequencyBinCount))
        
        console.log('🎵 Audio reactive sphere: Audio context created')
      } catch (error) {
        console.error('❌ Error creating audio context:', error)
      }
    }
    
    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close()
      }
    }
  }, [audioElement, isPlaying])

  // Основные частицы сферы (внешний слой)
  const mainGeometry = useMemo(() => {
    const points = []
    const colors = []
    const radius = 1.2
    
    for (let i = 0; i < 3000; i++) {
      // Равномерное распределение по сфере
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      points.push(new THREE.Vector3(x, y, z))
      
      // Градиентные цвета от синего к фиолетовому к розовому
      const colorValue = Math.random()
      let color = new THREE.Color()
      if (colorValue < 0.33) {
        color.setHSL(0.65, 0.8, 0.7) // Синий
      } else if (colorValue < 0.66) {
        color.setHSL(0.8, 0.9, 0.6) // Фиолетовый
      } else {
        color.setHSL(0.9, 0.7, 0.7) // Розовый
      }
      
      colors.push(color.r, color.g, color.b)
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geometry
  }, [])

  // Внутренние частицы (более яркие, меньше размером)
  const innerGeometry = useMemo(() => {
    const points = []
    const colors = []
    const radius = 0.8
    
    for (let i = 0; i < 1500; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      points.push(new THREE.Vector3(x, y, z))
      
      // Более яркие цвета для внутренних частиц
      const color = new THREE.Color()
      color.setHSL(0.75 + Math.random() * 0.2, 1, 0.8)
      colors.push(color.r, color.g, color.b)
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geometry
  }, [])

  // Материалы для частиц
  const mainMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.025,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
  }, [])

  const innerMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.015,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
  }, [])

  // Анимация и аудиореактивность
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Получаем данные частот
    let bassLevel = 0
    let midLevel = 0
    let highLevel = 0
    
    if (analyser && frequencyData && isPlaying) {
      analyser.getByteFrequencyData(frequencyData)
      
      // Разделяем частоты на басы, средние и высокие
      const third = Math.floor(frequencyData.length / 3)
      
      bassLevel = Array.from(frequencyData.slice(0, third))
        .reduce((sum, val) => sum + val, 0) / (third * 255)
      
      midLevel = Array.from(frequencyData.slice(third, third * 2))
        .reduce((sum, val) => sum + val, 0) / (third * 255)
      
      highLevel = Array.from(frequencyData.slice(third * 2))
        .reduce((sum, val) => sum + val, 0) / (third * 255)
    }
    
    if (particlesRef.current) {
      // Основная вращение с аудиореактивностью
      const rotationSpeed = 0.003 + bassLevel * 0.01
      particlesRef.current.rotation.y += rotationSpeed
      particlesRef.current.rotation.x += rotationSpeed * 0.5
      
      // Пульсация на основе средних частот
      const scale = 1 + midLevel * 0.3 + Math.sin(time * 2) * 0.05
      particlesRef.current.scale.setScalar(scale)
      
      // Изменение размера частиц на основе высоких частот
      if (particlesRef.current.material instanceof THREE.PointsMaterial) {
        particlesRef.current.material.size = 0.025 + highLevel * 0.02
        particlesRef.current.material.opacity = 0.7 + midLevel * 0.3
      }
      
      // Изменение позиций частиц для создания "взрыва" на басах
      if (bassLevel > 0.5) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const originalPositions = mainGeometry.attributes.position.array as Float32Array
        
        for (let i = 0; i < positions.length; i += 3) {
          const explosionForce = (bassLevel - 0.5) * 2
          const randomFactor = (Math.random() - 0.5) * explosionForce * 0.5
          
          positions[i] = originalPositions[i] * (1 + explosionForce * 0.3 + randomFactor)
          positions[i + 1] = originalPositions[i + 1] * (1 + explosionForce * 0.3 + randomFactor)
          positions[i + 2] = originalPositions[i + 2] * (1 + explosionForce * 0.3 + randomFactor)
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true
      }
    }
    
    if (innerParticlesRef.current) {
      // Внутренние частицы вращаются в обратную сторону
      const innerRotationSpeed = -0.005 - highLevel * 0.015
      innerParticlesRef.current.rotation.y += innerRotationSpeed
      innerParticlesRef.current.rotation.z += innerRotationSpeed * 0.7
      
      // Более интенсивная пульсация для внутренних частиц
      const innerScale = 1 + bassLevel * 0.5 + Math.sin(time * 3) * 0.08
      innerParticlesRef.current.scale.setScalar(innerScale)
      
      // Изменение размера и прозрачности внутренних частиц
      if (innerParticlesRef.current.material instanceof THREE.PointsMaterial) {
        innerParticlesRef.current.material.size = 0.015 + (bassLevel + highLevel) * 0.015
        innerParticlesRef.current.material.opacity = 0.8 + midLevel * 0.2
      }
    }
  })

  return (
    <>
      {/* Основные частицы */}
      <points ref={particlesRef} geometry={mainGeometry} material={mainMaterial} />
      
      {/* Внутренние частицы */}
      <points ref={innerParticlesRef} geometry={innerGeometry} material={innerMaterial} />
      
      {/* Дополнительное освещение для создания атмосферы */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={isPlaying ? 0.5 + (frequencyData ? 
          Array.from(frequencyData).reduce((sum, val) => sum + val, 0) / (frequencyData.length * 255) * 0.5 : 0) 
          : 0.2
        } 
        color="#4f46e5" 
      />
    </>
  )
} 