/**
 * خطاف التكبير والتركيز — يربط المحرّك النقي بحالة React
 * التكبير (نموذج RevealZoom): Alt+Click نحو النقطة، التفاف بالأطراف عبر rAF،
 * Esc للخروج، مستوى تكبير قابل للضبط — والليزر وتسليط الضوء لموضع الشرح.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { clampScale, panTowards, zoomCenter, zoomTo } from './engine';
import {
  SPOTLIGHT_DEFAULT_RADIUS,
  SPOTLIGHT_MAX_RADIUS,
  SPOTLIGHT_MIN_RADIUS,
  ZOOM_DEFAULT_SCALE,
  ZOOM_RESET,
} from './types';
import { isZoomed } from './types';
import type { ZoomState } from './types';

export interface SpotlightController {
  /** حالة التكبير الحالية */
  zoom: ZoomState;
  zoomActive: boolean;
  zoomScale: number;
  /** Alt+Click نحو نقطة — أو الخروج إن كان مكبَّراً (تبديل كالإضافة الأصلية) */
  zoomAt: (clientX: number, clientY: number, rect: DOMRect) => void;
  /** تكبير نحو مركز الشاشة */
  toggleZoomCenter: () => void;
  zoomOut: () => void;
  setZoomScale: (s: number) => void;
  nudgeZoom: (delta: number) => void;

  spotlightOn: boolean;
  toggleSpotlight: () => void;
  spotlightRadius: number;
  setSpotlightRadius: (r: number) => void;
  nudgeSpotlightRadius: (delta: number) => void;

  laserOn: boolean;
  toggleLaser: () => void;

  /** إغلاق كل الطبقات (Esc) */
  closeAll: () => void;
}

export function useSpotlight(): SpotlightController {
  const [zoom, setZoom] = useState<ZoomState>(ZOOM_RESET);
  const [zoomScale, setZoomScale] = useState(ZOOM_DEFAULT_SCALE);
  const [spotlightOn, setSpotlightOn] = useState(false);
  const [spotlightRadius, setSpotlightRadius] = useState(SPOTLIGHT_DEFAULT_RADIUS);
  const [laserOn, setLaserOn] = useState(false);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const mouseRef = useRef({ x: 0, y: 0 });

  const zoomActive = isZoomed(zoom);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const current = zoomRef.current;
      if (isZoomed(current)) {
        setZoom(ZOOM_RESET); // تكبير ثم نقر ثانٍ = خروج (سلوك الإضافة الأصلية)
        return;
      }
      setZoom(
        zoomTo(clientX, clientY, rect, current.scale === 1 ? ZOOM_DEFAULT_SCALE : current.scale),
      );
    },
    [],
  );

  const toggleZoomCenter = useCallback(() => {
    const current = zoomRef.current;
    if (isZoomed(current)) setZoom(ZOOM_RESET);
    else {
      setZoom(
        zoomCenter(
          { width: window.innerWidth, height: window.innerHeight },
          current.scale === 1 ? ZOOM_DEFAULT_SCALE : current.scale,
        ),
      );
    }
  }, []);

  const zoomOut = useCallback(() => setZoom(ZOOM_RESET), []);

  const nudgeZoom = useCallback((delta: number) => {
    setZoom((z) => {
      const scale = clampScale(z.scale + delta);
      if (scale === z.scale) return z;
      if (scale <= ZOOM_MIN_SCALE_LIMIT) return ZOOM_RESET;
      return { ...z, scale };
    });
  }, []);

  const nudgeSpotlightRadius = useCallback((delta: number) => {
    setSpotlightRadius((r) =>
      Math.max(SPOTLIGHT_MIN_RADIUS, Math.min(SPOTLIGHT_MAX_RADIUS, r + delta)),
    );
  }, []);

  const closeAll = useCallback(() => {
    setSpotlightOn(false);
    setLaserOn(false);
    setZoom(ZOOM_RESET);
  }, []);

  // تتبع المؤشر أثناء التكبير (الالتفاف نحو الأطراف)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // حلقة الالتفاف — تعمل فقط أثناء التكبير (كما تفعل الإضافة الأصلية بـ setInterval)
  useEffect(() => {
    if (!zoomActive) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const rect = { width: window.innerWidth, height: window.innerHeight };
      const next = panTowards(zoomRef.current, mouseRef.current, rect, dt);
      if (next !== zoomRef.current) setZoom(next);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [zoomActive]);

  return {
    zoom,
    zoomActive,
    zoomScale,
    zoomAt,
    toggleZoomCenter,
    zoomOut,
    setZoomScale,
    nudgeZoom,
    spotlightOn,
    toggleSpotlight: useCallback(() => setSpotlightOn((v) => !v), []),
    spotlightRadius,
    setSpotlightRadius,
    nudgeSpotlightRadius,
    laserOn,
    toggleLaser: useCallback(() => setLaserOn((v) => !v), []),
    closeAll,
  };
}

const ZOOM_MIN_SCALE_LIMIT = 1.05;
