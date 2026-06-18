import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeParticleSystem() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 500;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 250;

    // 3. Renderer Setup with transparent background
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Programmable Golden-Amber Radial Gradient Particle Texture
    // This avoids needing external asset files and guarantees immediate, crisp load.
    const createParticleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, "rgba(234, 179, 8, 1)");      // Solid amber center
        gradient.addColorStop(0.2, "rgba(212, 175, 55, 0.8)"); // Premium gold inner-glow
        gradient.addColorStop(0.5, "rgba(202, 138, 4, 0.3)");  // Darker gold outer-halo
        gradient.addColorStop(1, "rgba(3, 6, 12, 0)");         // Seamless alpha fade into slate darkness
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleTexture = createParticleTexture();

    // 5. Particles Specifications & Coordinates Configuration
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    
    // Position array
    const positions = new Float32Array(particleCount * 3);
    // Custom dynamic velocities for each particle
    const velocities: { x: number; y: number; z: number }[] = [];
    // Anchor position to remember natural home coordinate/random orbital origin
    const listNaturalPos: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Place particles in a generous 3D box centered in space
      const x = (Math.random() - 0.5) * 500;
      const y = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 200;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      listNaturalPos.push({ x, y, z });

      // Slower, graceful natural velocities
      velocities.push({
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.2
      });
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // 6. Particles Material with elegant blending
    const material = new THREE.PointsMaterial({
      size: 6,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // 7. Interactive Mouse Attractor State
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };

    // Coordinate conversion helper
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;

      // Map coords to [-1, 1]
      const nX = (relativeX / width) * 2 - 1;
      const nY = -(relativeY / height) * 2 + 1;

      // Project into three.js view space dimension
      mouse.targetX = nX * 220;
      mouse.targetY = nY * 160;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // 8. Animation & Smooth Integration Physics Loop
    let animationFrameId: number;
    const posAttribute = geometry.attributes.position as THREE.BufferAttribute;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Interpolate real mouse coordinates for buttery cinematic inertia
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const currentPositions = posAttribute.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        let px = currentPositions[i3];
        let py = currentPositions[i3 + 1];
        let pz = currentPositions[i3 + 2];

        // Fetch natural drift parameters
        const vel = velocities[i];
        const origin = listNaturalPos[i];

        if (mouse.active) {
          // 1. Active Attractor State: Gently pull toward the cursor coordinates with soft scaling
          const dx = mouse.x - px;
          const dy = mouse.y - py;
          
          // Strength diminishes dynamically with distance to ensure elegant orbital dispersion (no hard grouping)
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const attractionForce = Math.min(1.2, 50 / dist);

          // Apply gentle acceleration with drag
          vel.x += (dx / dist) * attractionForce * 0.012;
          vel.y += (dy / dist) * attractionForce * 0.012;
        } else {
          // 2. Default Cinematic Pulse: Pull slowly back toward home coordinate
          const hex = origin.x - px;
          const hey = origin.y - py;
          vel.x += hex * 0.0001;
          vel.y += hey * 0.0001;
        }

        // Limit maximum velocities to maintain a premium, quiet, and peaceful glide
        const speedLimit = 1.3;
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        if (speed > speedLimit) {
          vel.x = (vel.x / speed) * speedLimit;
          vel.y = (vel.y / speed) * speedLimit;
        }

        // Apply velocities
        px += vel.x;
        py += vel.y;
        pz += vel.z;

        // Apply gentle damping / resistance
        vel.x *= 0.985;
        vel.y *= 0.985;

        // Boundary reflection or gentle reset if they stray completely out of the frame
        if (Math.abs(px) > 350) {
          px = (Math.random() - 0.5) * 500;
          vel.x = 0;
        }
        if (Math.abs(py) > 280) {
          py = (Math.random() - 0.5) * 400;
          vel.y = 0;
        }

        currentPositions[i3] = px;
        currentPositions[i3 + 1] = py;
        currentPositions[i3 + 2] = pz;
      }

      posAttribute.needsUpdate = true;

      // Slow orbital rotate effect to the whole system
      particleSystem.rotation.y += 0.0012;
      particleSystem.rotation.x += 0.0004;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Observer handling container size shifts fluidly
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = entry.contentRect.width || container.clientWidth;
        height = entry.contentRect.height || container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    });

    resizeObserver.observe(container);

    // 10. Memory Cleanups upon React Unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
