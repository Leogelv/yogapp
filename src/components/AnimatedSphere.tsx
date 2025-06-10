'use client' // если ты в Next.js App Router

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function PointSphereCanvas({className}: {className?: string}) {
    return (
        <div className={className} style={{ width: '600px', aspectRatio: '1/1', background: '#191919' }}>
            <Canvas camera={{ position: [0, 0, 3] }}>
                <ambientLight />
                <PointSphere />
            </Canvas>
        </div>
    )
}

function PointSphere() {
    const ref = useRef<THREE.Points>(null!)

    const geometry = useMemo(() => {
        const points = []
        const radius = 1
        for (let i = 0; i < 2000; i++) {
            const phi = Math.acos(2 * Math.random() - 1)
            const theta = 2 * Math.PI * Math.random()
            const x = radius * Math.sin(phi) * Math.cos(theta)
            const y = radius * Math.sin(phi) * Math.sin(theta)
            const z = radius * Math.cos(phi)
            points.push(new THREE.Vector3(x, y, z))
        }
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [])

    const material = useMemo(() => {
        return new THREE.PointsMaterial({
            color: 'white',
            size: 0.02,
            sizeAttenuation: true,
        })
    }, [])

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.002
        }
    })

    return <points ref={ref} geometry={geometry} material={material} />
}
