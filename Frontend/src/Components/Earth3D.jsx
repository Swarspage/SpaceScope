import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// Helper to convert Lat/Lon to 3D Vector on a sphere
const calcPosFromLatLonRad = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return [x, y, z];
};

const Globe = ({ issPosition }) => {
    const earthRef = useRef();
    const cloudsRef = useRef();

    // Load Textures (Standard NASA Blue Marble textures)
    const [colorMap, specularMap, cloudsMap] = useMemo(() => {
        const loader = new THREE.TextureLoader();
        return [
            loader.load('https://upload.wikimedia.org/wikipedia/commons/8/85/Solarsystemscope_texture_2k_earth_daymap.jpg'),
            loader.load('https://upload.wikimedia.org/wikipedia/commons/2/22/Solarsystemscope_texture_2k_earth_specular_map.jpg'),
            loader.load('https://upload.wikimedia.org/wikipedia/commons/a/ae/Solarsystemscope_texture_2k_earth_clouds.jpg'),
        ];
    }, []);

    useFrame(() => {
        // Slow rotation of Earth
        if (earthRef.current) earthRef.current.rotation.y += 0.0005;
        if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0007; // Clouds move faster
    });

    // Calculate ISS Position
    const issVector = useMemo(() => {
        if (!issPosition) return [0, 0, 0];
        // Earth radius in Three.js units is 2, ISS orbits slightly higher (2.5)
        // Note: We subtract rotation of earth from lon if we want it precise, 
        // but for this visual, we plot relative to the static sphere geometry
        return calcPosFromLatLonRad(issPosition.lat, issPosition.lon, 2.5);
    }, [issPosition]);

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

            {/* ISS Marker */}
            {issPosition && (
                <mesh position={issVector}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshBasicMaterial color="#00d9ff" />
                    <Html distanceFactor={10}>
                        <div className="bg-black/80 text-cyan-400 text-[10px] px-2 py-1 rounded border border-cyan-500/50 whitespace-nowrap">
                            ISS
                        </div>
                    </Html>
                </mesh>
            )}
        </group>
    );
};

const Earth3D = ({ issLat, issLon }) => {
    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Globe issPosition={{ lat: parseFloat(issLat || 0), lon: parseFloat(issLon || 0) }} />
                <OrbitControls enableZoom={true} enablePan={false} minDistance={3} maxDistance={10} />
            </Canvas>
        </div>
    );
};

export default Earth3D;
