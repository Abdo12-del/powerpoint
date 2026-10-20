import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { isWebGLAvailable } from '../webgl';

export interface UseThreeSceneOptions {
  antialias?: boolean;
  alpha?: boolean;
  pixelRatio?: number;
  onInit?: (ctx: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer }) => void;
  onFrame?: (ctx: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; time: number; delta: number }) => void;
}

/**
 * خطاف Three.js — يُنشئ مشهداً كاملاً مع كاميرا ومُصيّر ويُشغّل حلقة rAF
 * آمن في بيئات بلا WebGL (jsdom/CI): يتخطى الإنشاء بصمت عند غياب الدعم
 */
export function useThreeScene(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseThreeSceneOptions = {},
) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!isWebGLAvailable()) return; // بلا GPU — لا نحاول الإنشاء

    const { antialias = true, alpha = true, pixelRatio = Math.min(window.devicePixelRatio, 2), onInit, onFrame } =
      optionsRef.current;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias, alpha, powerPreference: 'high-performance' });
    } catch {
      return; // فشل إنشاء السياق — نتجاهل بهدوء
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight || 16 / 9, 0.1, 100);
    camera.position.set(0, 1.2, 6);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(canvas.clientWidth || 1280, canvas.clientHeight || 720, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    onInit?.({ scene, camera, renderer });

    const timer = new THREE.Timer();

    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    window.addEventListener('resize', onResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timer.update();
      const delta = timer.getDelta();
      const time = timer.getElapsed();
      onFrame?.({ scene, camera, renderer, time, delta });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
    // يُنشأ المشهد مرة واحدة فقط — الإعدادات تتغير عبر refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sceneRef, cameraRef, rendererRef };
}
