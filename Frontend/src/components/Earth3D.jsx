import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';


const Globe = () => {
    const earthRef = useRef();
    const cloudsRef = useRef();

    // Load Textures (Standard NASA Blue Marble textures)
    // Load Textures (Standard NASA Blue Marble textures)
    // Load Textures (Reliable hosted assets from pmndrs)
    // Load Textures (Reliable hosted assets from pmndrs via jsDelivr)
    const [colorMap, specularMap, cloudsMap] = useTexture([
        'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/earth/earthmap1k.jpg',
        'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/earth/earthspec1k.jpg',
        'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/earth/earthcloudmap.jpg'
    ]);

    useFrame(() => {
        // Slow rotation of Earth
        if (earthRef.current) earthRef.current.rotation.y += 0.0005;
        if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0007; // Clouds move faster
    });



    return (
        <group>
            {/* Earth Sphere */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshPhongMaterial
                    map={colorMap}
                    specularMap={specularMap}
                    specular={new THREE.Color('grey')}
                    shininess={10}
                />
            </mesh>

            {/* Cloud Layer */}
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[2.02, 32, 32]} />
                <meshPhongMaterial
                    map={cloudsMap}
                    transparent={true}
                    opacity={0.4}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>


        </group>
    );
};


class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("Earth3D Error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            // Fallback: Simple Blue Sphere if textures fail
            return (
                <mesh>
                    <sphereGeometry args={[2, 32, 32]} />
                    <meshPhongMaterial color="#1E90FF" emissive="#000022" specular="#555555" shininess={10} />
                </mesh>
            );
        }
        return this.props.children;
    }
}

const LoadingPlaceholder = () => (
    <mesh>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial color="#333" wireframe />
    </mesh>
);

const Earth3D = () => {
    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ErrorBoundary>
                    <Suspense fallback={<LoadingPlaceholder />}>
                        <Globe />
                    </Suspense>
                </ErrorBoundary>
                <OrbitControls enableZoom={true} enablePan={false} minDistance={3} maxDistance={10} />
            </Canvas>
        </div>
    );
};

export default Earth3D;
