/**
 * خطاف إدارة زمن Flyover — تحكم دقيق في المسار والسرعة والعمق + معاينة الإطارات
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { FlyoverConfig } from '../types';
import { DEFAULT_FLYOVER_CONFIG } from '../types';

export interface FlyoverTimelineController {
  time: number;
  playing: boolean;
  config: FlyoverConfig;
  duration: number;
  progress: number; // 0..1

  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  seekProgress: (p: number) => void; // 0..1
  setSpeed: (s: number) => void;
  setDepth: (d: number) => void;
  setFocus: (f: number) => void;
  setAperture: (a: number) => void;
  updatePathPoint: (index: number, patch: Partial<FlyoverConfig['path'][number]>) => void;
  reset: () => void;
  /** نقاط معاينة الإطارات المحددة */
  previewPoints: number[];
  goToPreview: (index: number) => void;
}

export function useFlyoverTimeline(
  initialConfig: Partial<FlyoverConfig> = {},
  previewPoints: number[] = [0, 3, 6, 9, 12, 15],
): FlyoverTimelineController {
  const [config, setConfig] = useState<FlyoverConfig>(() => ({ ...DEFAULT_FLYOVER_CONFIG, ...initialConfig }));
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(performance.now());

  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => setPlaying((p) => !p), []);

  const seek = useCallback((t: number) => {
    setTime(Math.max(0, Math.min(t, config.duration)));
  }, [config.duration]);

  const seekProgress = useCallback((p: number) => {
    const clamped = Math.max(0, Math.min(p, 1));
    setTime(clamped * config.duration);
  }, [config.duration]);

  const setSpeed = useCallback((speed: number) => {
    setConfig((c) => ({ ...c, speed: Math.max(0.1, Math.min(speed, 3)) }));
  }, []);

  const setDepth = useCallback((depthIntensity: number) => {
    setConfig((c) => ({ ...c, depthIntensity: Math.max(0, Math.min(depthIntensity, 1)) }));
  }, []);

  const setFocus = useCallback((focusDistance: number) => {
    setConfig((c) => ({ ...c, focusDistance }));
  }, []);

  const setAperture = useCallback((aperture: number) => {
    setConfig((c) => ({ ...c, aperture: Math.max(0.01, Math.min(aperture, 0.2)) }));
  }, []);

  const updatePathPoint = useCallback((index: number, patch: Partial<FlyoverConfig['path'][number]>) => {
    setConfig((c) => {
      const path = [...c.path];
      if (path[index]) path[index] = { ...path[index], ...patch };
      return { ...c, path };
    });
  }, []);

  const reset = useCallback(() => {
    setTime(0);
    setPlaying(true);
    lastRef.current = performance.now();
  }, []);

  const goToPreview = useCallback((index: number) => {
    const pt = previewPoints[index];
    if (pt !== undefined) {
      setTime(pt);
      setPlaying(false);
    }
  }, [previewPoints]);

  // حلقة الزمن عند التشغيل
  useEffect(() => {
    if (!playing) return;
    lastRef.current = performance.now();

    const loop = () => {
      const now = performance.now();
      const delta = (now - lastRef.current) / 1000;
      lastRef.current = now;

      setTime((prev) => {
        const next = prev + delta * config.speed;
        if (next >= config.duration) return 0; // حلقة
        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, config.speed, config.duration]);

  return {
    time,
    playing,
    config,
    duration: config.duration,
    progress: config.duration > 0 ? time / config.duration : 0,
    play,
    pause,
    toggle,
    seek,
    seekProgress,
    setSpeed,
    setDepth,
    setFocus,
    setAperture,
    updatePathPoint,
    reset,
    previewPoints,
    goToPreview,
  };
}
