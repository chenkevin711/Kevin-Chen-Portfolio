import React, { Suspense, useEffect, useState } from 'react'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Preload, useGLTF } from '@react-three/drei'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three'
import CanvasLoader from "../Loader"

const Computers = ({ isMobile }) => {
	const computer = useLoader(GLTFLoader, './robot_playground/scene.gltf')

	let mixer
    if (computer.animations.length) {
        mixer = new THREE.AnimationMixer(computer.scene);
        computer.animations.forEach(clip => {
            const action = mixer.clipAction(clip)
            action.play();
        });
    }

	useFrame((state, delta) => {
		mixer?.update(delta)
	})

	computer.scene.traverse(child => {
		if (child.isMesh) {
			child.castShadow = true
			child.receiveShadow = true
			child.material.side = THREE.FrontSide
		}
	})

	return (
		<mesh rotation={[0, 2.5, 0]}>
			<hemisphereLight intensity={0.15} groundColor='black'/>
			<pointLight intensity={1}/>
			<spotLight 
				position={[-20, 50, 10]}
				angle={0.12}
				penumbra={1}
				intensity={1}
				castShadow
				shadow-mapSize={1024}
			/>
			<primitive 
				object={computer.scene}
				scale={isMobile ? 1.3 : 3}
				position={isMobile ? [0, -2, 0] : [0,  -3.2, 0]}
				rotation={[-0.01, -1.8, -0.1]}
			/>
		</mesh>
	)
}

const ComputerCanvas = () => {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia('(max-width: 500px)')

		setIsMobile(mediaQuery.matches)

		const handleMediaQueryChange = (event) => {
			setIsMobile(event.matches)
		}

		mediaQuery.addEventListener('change', handleMediaQueryChange)

		return () => {
			mediaQuery.removeEventListener('change', handleMediaQueryChange)
		}
	}, [])

	return (
		<Canvas
			frameloop='demand'
			shadows
			camera={{position: [20, 3, 5], fov: 25}}
			gl={{ preserveDrawingBuffer: true }}
		>
			<Suspense fallback={<CanvasLoader />}>
				<OrbitControls 
					autoRotate
					enableZoom={false} 
					maxPolarAngle={Math.PI / 2} 
					minPolarAngle={Math.PI / 2}
				/>
				<Computers isMobile={isMobile}/>
			</Suspense>
	
			<Preload all />
		</Canvas>
	)
}

export default ComputerCanvas