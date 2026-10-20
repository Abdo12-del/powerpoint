import { useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { useThreeScene } from './useThreeScene';

export interface ThreeCanvasHandle {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  captureFrame: () => string | undefined;
}

export interface ThreeCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  pixelRatio?: number;
  onInit?: (ctx: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer }) => void;
  onFrame?: (ctx: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; time: number; delta: number }) => void;
}

/**
 * عنصر canvas ثلاثي الأبعاد — يغلّف Three.js بحلقة حياة React
 */
export const ThreeCanvas = forwardRef<ThreeCanvasHandle, ThreeCanvasProps>(function ThreeCanvas(
  { className, style, pixelRatio, onInit, onFrame },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { sceneRef, cameraRef, rendererRef } = useThreeScene(canvasRef, { pixelRatio, onInit, onFrame });

  useImperativeHandle(ref, () => ({
    get scene() {
      return sceneRef.current;
    },
    get camera() {
      return cameraRef.current;
    },
    get renderer() {
      return rendererRef.current;
    },
    captureFrame: () => {
      const r = rendererRef.current;
      if (!r) return undefined;
      try {
        return r.domElement.toDataURL('image/png');
      } catch {
        return undefined;
      }
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className={className ?? 'h-full w-full'}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
});
