/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sun, CloudRain, Flame, RotateCcw, Maximize2 } from 'lucide-react';

interface CropField3DProps {
  weatherMode?: 'sunny' | 'rain' | 'heat_wave';
  ambientTempC?: number;
  className?: string;
}

export const CropField3D: React.FC<CropField3DProps> = ({
  weatherMode = 'sunny',
  ambientTempC = 32,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeWeather, setActiveWeather] = useState<'sunny' | 'rain' | 'heat_wave'>(weatherMode);

  useEffect(() => {
    setActiveWeather(weatherMode);
  }, [weatherMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(
      activeWeather === 'rain' ? 0x94a3b8 : activeWeather === 'heat_wave' ? 0xfef08a : 0xecfdf5
    );
    scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 3.5, 6.5);
    camera.lookAt(0, 0.8, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = activeWeather === 'heat_wave' ? 1.25 : 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Studio PBR Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(
      activeWeather === 'heat_wave' ? 0xfbbf24 : 0xfffbeb,
      activeWeather === 'rain' ? 0.8 : 1.8
    );
    dirLight.position.set(6, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // 4. Procedural Farm Soil Bed (Furrows)
    const soilGeo = new THREE.BoxGeometry(7, 0.5, 7, 24, 1, 24);
    // Displace vertices to form furrow ridges
    const pos = soilGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const y = pos.getY(i);
      if (y > 0.1) {
        // sinusoidal ridge along z
        const ridge = Math.sin(pos.getX(i) * 3) * 0.12;
        pos.setY(i, y + ridge);
      }
    }
    soilGeo.computeVertexNormals();

    const soilMat = new THREE.MeshStandardMaterial({
      color: activeWeather === 'rain' ? 0x271911 : 0x543622, // darker when wet
      roughness: 0.9,
      metalness: 0.05,
    });
    const soilBed = new THREE.Mesh(soilGeo, soilMat);
    soilBed.position.y = -0.25;
    soilBed.receiveShadow = true;
    scene.add(soilBed);

    // 5. Composite 5-Part Procedural Crop Plants (THREE.Group)
    // Leaf geometry
    const leafGeo = new THREE.ConeGeometry(0.18, 0.65, 5);
    leafGeo.rotateX(Math.PI / 2);
    leafGeo.scale(1, 0.2, 2.2);

    const stemGeo = new THREE.CylinderGeometry(0.04, 0.06, 1.4, 8);
    const fruitGeo = new THREE.SphereGeometry(0.12, 10, 10);

    const plantMat = new THREE.MeshStandardMaterial({
      color: activeWeather === 'heat_wave' ? 0x65a30d : 0x15803d,
      roughness: 0.6,
      metalness: 0.1,
    });

    const fruitMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.4,
      metalness: 0.05,
    });

    const plantsGroup = new THREE.Group();

    // Plant 9 crops in a 3x3 grid along soil ridges
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        const plant = new THREE.Group();
        plant.position.set(col * 2.0, 0, row * 2.0);

        // 1. Main Stem
        const stem = new THREE.Mesh(stemGeo, plantMat);
        stem.position.y = 0.7;
        stem.castShadow = true;
        stem.receiveShadow = true;
        plant.add(stem);

        // 2-5. Leaves radiating outward at different heights
        const leafHeights = [0.4, 0.7, 1.0, 1.2];
        const leafRotations = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

        leafHeights.forEach((h, idx) => {
          const leaf = new THREE.Mesh(leafGeo, plantMat);
          leaf.position.set(0, h, 0);
          leaf.rotation.y = leafRotations[idx] + col * 0.2;
          leaf.rotation.z = -0.65; // drooping angle
          leaf.castShadow = true;
          plant.add(leaf);
        });

        // 6. Fruit/Grain cluster at apex
        const fruit = new THREE.Mesh(fruitGeo, fruitMat);
        fruit.position.set(0.08, 1.15, 0.08);
        fruit.castShadow = true;
        plant.add(fruit);

        // Soft contact shadow disk on ground
        const shadowDisk = new THREE.Mesh(
          new THREE.CircleGeometry(0.4, 16),
          new THREE.MeshBasicMaterial({ color: 0x1f140e, opacity: 0.4, transparent: true })
        );
        shadowDisk.rotation.x = -Math.PI / 2;
        shadowDisk.position.y = 0.02;
        plant.add(shadowDisk);

        plantsGroup.add(plant);
      }
    }
    scene.add(plantsGroup);

    // 6. Rain particles if rain weather
    let rainParticles: THREE.Points | null = null;
    let rainPositions: Float32Array | null = null;
    const rainCount = 600;

    if (activeWeather === 'rain') {
      const rainGeo = new THREE.BufferGeometry();
      rainPositions = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount; i++) {
        rainPositions[i * 3] = (Math.random() - 0.5) * 8;
        rainPositions[i * 3 + 1] = Math.random() * 6;
        rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      const rainMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.05,
        transparent: true,
        opacity: 0.75,
      });
      rainParticles = new THREE.Points(rainGeo, rainMat);
      scene.add(rainParticles);
    }

    // 7. Interactive Damped Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let targetRotationY = 0.4;
    let currentRotationY = 0.4;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      targetRotationY += deltaX * 0.008;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. 60 FPS Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Exponential damping on rotation
      currentRotationY += (targetRotationY - currentRotationY) * (1 - Math.exp(-10 * dt));
      scene.rotation.y = currentRotationY;

      // Gentle leaf swaying in breeze
      plantsGroup.children.forEach((plant, idx) => {
        const sway = Math.sin(elapsed * 2.2 + idx) * 0.03;
        plant.rotation.z = sway;
      });

      // Animate rain drops
      if (rainParticles && rainPositions) {
        for (let i = 0; i < rainCount; i++) {
          rainPositions[i * 3 + 1] -= dt * 6.5;
          if (rainPositions[i * 3 + 1] < 0) {
            rainPositions[i * 3 + 1] = 5.5;
          }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 10. Memory Clean-Up & Disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      soilGeo.dispose();
      soilMat.dispose();
      leafGeo.dispose();
      stemGeo.dispose();
      fruitGeo.dispose();
      plantMat.dispose();
      fruitMat.dispose();
      if (rainParticles) {
        rainParticles.geometry.dispose();
        (rainParticles.material as THREE.Material).dispose();
      }
      renderer.dispose();
      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
    };
  }, [activeWeather]);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-900 shadow-md ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-72 sm:h-80 cursor-grab active:cursor-grabbing" />

      {/* Floating Weather Simulation Controls */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 p-1 rounded-xl bg-stone-900/80 backdrop-blur-md border border-white/10 text-white text-xs">
        <button
          onClick={() => setActiveWeather('sunny')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
            activeWeather === 'sunny' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-300 hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-300" />
          <span>Optimal</span>
        </button>

        <button
          onClick={() => setActiveWeather('heat_wave')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
            activeWeather === 'heat_wave' ? 'bg-amber-600 text-white font-bold' : 'text-stone-300 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-red-300" />
          <span>Heat Wave</span>
        </button>

        <button
          onClick={() => setActiveWeather('rain')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
            activeWeather === 'rain' ? 'bg-sky-600 text-white font-bold' : 'text-stone-300 hover:text-white'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5 text-sky-200" />
          <span>Heavy Rain</span>
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 right-3 text-[10px] text-stone-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 pointer-events-none">
        3D Field Canopy Simulation · Drag to orbit
      </div>
    </div>
  );
};
