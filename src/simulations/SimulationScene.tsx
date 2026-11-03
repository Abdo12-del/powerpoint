import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { SimulationDefinition, SimulationValues } from './types';

/** مشهد Three.js خفيف، مستقل عن DOM الشرائح، يُنشأ ويُنظّف مع دورة حياة React. */
export function SimulationScene({ definition, values, playing, time, onDrag }: {
  definition: SimulationDefinition; values: SimulationValues; playing: boolean; time: number; onDrag: (value: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ definition, values, playing, time, onDrag });
  stateRef.current = { definition, values, playing, time, onDrag };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      host.dataset.webgl = 'unavailable';
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth || 700, host.clientHeight || 420);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1.65, 0.1, 100);
    camera.position.set(0, 4.6, 13.5);
    camera.lookAt(0, 0.8, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const keyLight = new THREE.DirectionalLight(0xffe2c6, 3);
    keyLight.position.set(-4, 8, 5); scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x73cfff, 28, 16);
    rimLight.position.set(4, 4, -2); scene.add(rimLight);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshStandardMaterial({ color: 0x101921, roughness: 0.92, metalness: 0.12 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -1.42; scene.add(floor);
    const grid = new THREE.GridHelper(24, 36, 0x40505a, 0x26333c);
    grid.position.y = -1.4; scene.add(grid);

    const accent = new THREE.Color(stateRef.current.definition.accent);
    const material = new THREE.MeshPhysicalMaterial({ color: accent, roughness: 0.28, metalness: 0.18, clearcoat: 0.8, emissive: accent, emissiveIntensity: 0.12 });
    const objects: THREE.Object3D[] = [];
    const sphereGeo = new THREE.SphereGeometry(0.42, 40, 32);
    const addSphere = (radius = 0.42, mat: THREE.Material = material) => {
      const mesh = new THREE.Mesh(radius === 0.42 ? sphereGeo : new THREE.SphereGeometry(radius, 28, 20), mat);
      scene.add(mesh); objects.push(mesh); return mesh;
    };
    const group = new THREE.Group(); scene.add(group); objects.push(group);
    let primary: THREE.Mesh;
    if (definition.id === 'projectile') {
      primary = addSphere(0.32);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.1, 0.35, 48), new THREE.MeshStandardMaterial({ color: 0x35434a, metalness: 0.7, roughness: 0.35 }));
      base.position.set(-4, -1.18, 0); scene.add(base); objects.push(base);
      const launch = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.25, 32), new THREE.MeshStandardMaterial({ color: 0x8f6650, metalness: 0.5, roughness: 0.3 }));
      launch.position.set(-4, -0.52, 0); launch.rotation.z = Math.PI / 4; scene.add(launch); objects.push(launch);
    } else if (definition.id === 'molecule') {
      primary = addSphere(0.74);
      primary.material = new THREE.MeshPhysicalMaterial({ color: 0x9f83ff, roughness: 0.18, metalness: 0.12, transparent: true, opacity: 0.86, emissive: 0x443377, emissiveIntensity: 0.5 });
      for (let i = 0; i < 8; i++) {
        const atom = addSphere(i % 3 === 0 ? 0.24 : 0.16, new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0xffbd76 : 0x82d5fa, metalness: 0.25, roughness: 0.23, emissive: i % 3 === 0 ? 0x51351f : 0x15374a, emissiveIntensity: 0.4 }));
        atom.userData.orbit = { radius: 1.45 + (i % 2) * 0.65, speed: 0.42 + i * 0.055, phase: i * Math.PI / 4, tilt: (i % 3 - 1) * 0.42 };
      }
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.65 + i * 0.25, 0.012, 8, 96), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.22 }));
        ring.rotation.set(0.5 + i * 0.55, i * 0.62, 0); scene.add(ring); objects.push(ring);
      }
    } else if (definition.id === 'cell') {
      primary = new THREE.Mesh(new THREE.SphereGeometry(2.25, 48, 32), new THREE.MeshPhysicalMaterial({ color: 0x4aa982, roughness: 0.32, transparent: true, opacity: 0.16, side: THREE.DoubleSide, transmission: 0.25, thickness: 0.7, emissive: 0x144a36, emissiveIntensity: 0.4 }));
      scene.add(primary); objects.push(primary);
      const nucleus = addSphere(0.8, new THREE.MeshPhysicalMaterial({ color: 0x7c8aff, roughness: 0.22, emissive: 0x262b77, emissiveIntensity: 0.4 })); nucleus.position.set(0, 0, 0);
      for (let i = 0; i < 28; i++) {
        const particle = addSphere(0.065 + Math.random() * 0.04, new THREE.MeshStandardMaterial({ color: i % 2 ? 0x76dfbd : 0xf6c27d, emissive: i % 2 ? 0x164b3b : 0x614221, emissiveIntensity: 0.55 }));
        particle.userData.diffusion = { phase: Math.random() * Math.PI * 2, radius: 0.5 + Math.random() * 1.5, speed: 0.3 + Math.random() * 0.7 };
      }
    } else {
      primary = new THREE.Mesh(new THREE.TorusKnotGeometry(1.32, 0.12, 220, 16, 2, 3), new THREE.MeshPhysicalMaterial({ color: accent, roughness: 0.2, metalness: 0.3, emissive: accent, emissiveIntensity: 0.17 }));
      scene.add(primary); objects.push(primary);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.012, 8, 120), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.5 }));
      ring.rotation.x = Math.PI / 2; scene.add(ring); objects.push(ring);
      for (let i = 0; i < 3; i++) {
        const orbit = new THREE.Mesh(new THREE.TorusGeometry(0.45 + i * 0.16, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: i === 1 ? 0xffdb9a : accent, transparent: true, opacity: 0.65 }));
        orbit.position.set(-3 + i * 3, -0.75, 0.8); orbit.rotation.x = Math.PI / 2; scene.add(orbit); objects.push(orbit);
      }
    }
    const resize = () => {
      const w = host.clientWidth || 700; const h = host.clientHeight || 420;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const state = stateRef.current;
      const t = state.time;
      const vals = state.values;
      if (definition.id === 'projectile') {
        const v = vals.speed ?? 20; const rad = (vals.angle ?? 45) * Math.PI / 180; const g = vals.gravity ?? 9.8;
        const duration = Math.max(0.1, 2 * v * Math.sin(rad) / g);
        const progress = state.playing ? (t % duration) / duration : Math.min(t / duration, 1);
        const flight = progress * duration;
        primary.position.set(-4 + Math.max(0, v * Math.cos(rad) * flight * 0.22), -1.05 + Math.max(0, (v * Math.sin(rad) * flight - 0.5 * g * flight * flight) * 0.16), 0.15);
        primary.rotation.x += state.playing ? 0.018 : 0;
        primary.scale.setScalar(1 + Math.sin(t * 2) * 0.025);
      } else if (definition.id === 'molecule') {
        primary.rotation.y = t * 0.17; primary.scale.setScalar(0.92 + (vals.concentration ?? 1) * 0.08);
        for (const object of objects) {
          const orbit = object.userData.orbit as { radius: number; speed: number; phase: number; tilt: number } | undefined;
          if (!orbit) continue;
          const angle = t * orbit.speed * (0.45 + (vals.temperature ?? 35) / 70) + orbit.phase;
          object.position.set(Math.cos(angle) * orbit.radius, Math.sin(angle * 0.78) * orbit.radius * orbit.tilt, Math.sin(angle) * orbit.radius);
        }
      } else if (definition.id === 'cell') {
        for (const object of objects) {
          const diffusion = object.userData.diffusion as { phase: number; radius: number; speed: number } | undefined;
          if (!diffusion) continue;
          const time = t * diffusion.speed * ((vals.permeability ?? 55) / 55) + diffusion.phase;
          object.position.set(Math.cos(time) * diffusion.radius, Math.sin(time * 1.37) * diffusion.radius * 0.66, Math.sin(time * 0.73) * diffusion.radius);
        }
        primary.rotation.y = t * 0.06;
      } else {
        primary.rotation.y = t * 0.22; primary.rotation.x = Math.sin(t * 0.14) * 0.17;
        primary.scale.setScalar(0.92 + (vals.amplitude ?? 1.6) * 0.06);
      }
      renderer.render(scene, camera);
    };
    tick();
    const canvas = renderer.domElement;
    let dragging = false;
    const start = (event: PointerEvent) => { dragging = true; canvas.setPointerCapture(event.pointerId); move(event); };
    const move = (event: PointerEvent) => {
      if (!dragging || definition.id !== 'projectile') return;
      const bounds = canvas.getBoundingClientRect();
      const normalized = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      stateRef.current.onDrag(Math.round(75 - normalized * 60));
    };
    const end = () => { dragging = false; };
    canvas.addEventListener('pointerdown', start); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    return () => {
      cancelAnimationFrame(raf); observer.disconnect();
      canvas.removeEventListener('pointerdown', start); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', end); canvas.removeEventListener('pointercancel', end);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach((mat) => mat.dispose()); }
      });
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [definition]);

  return <div ref={hostRef} className="sim-scene" aria-label={`مشهد ثلاثي الأبعاد: ${definition.title}`} role="img" />;
}
