import { useEffect, useRef, useState } from 'react';
import { formatHex, parse } from 'culori';
import type { Arc as CobeArc, Globe as CobeInstance, Marker as CobeMarker } from 'cobe';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion-prefs';

type RGBColor = [number, number, number];

/** Cobe locations use [latitude, longitude] (unlike MapChart's [longitude, latitude]). */
export interface GlobeCanvasMarker {
  id?: string;
  location: [latitude: number, longitude: number];
  size?: number;
  color?: string;
}

/** Arc endpoints use [latitude, longitude], matching Cobe's own API. */
export interface GlobeCanvasArc {
  id?: string;
  from: [latitude: number, longitude: number];
  to: [latitude: number, longitude: number];
  color?: string;
}

export interface GlobeCanvasProps {
  markers?: readonly GlobeCanvasMarker[];
  arcs?: readonly GlobeCanvasArc[];
  /** CSS color literal; if omitted, the globe reads the presentation theme variables. */
  baseColor?: string;
  markerColor?: string;
  arcColor?: string;
  glowColor?: string;
  /** Slow rotation in radians per second; set to 0 for a still globe. */
  rotationSpeed?: number;
  ariaLabel?: string;
  className?: string;
}

const DEFAULT_COLORS = {
  base: '#1e293b',
  marker: '#fbbf24',
  arc: '#38bdf8',
  glow: '#38bdf8',
};
const EMPTY_MARKERS: readonly GlobeCanvasMarker[] = [];
const EMPTY_ARCS: readonly GlobeCanvasArc[] = [];

function toRgb(color: string | undefined, fallback: string): RGBColor {
  const parsed = parse(color?.trim() || '') ?? parse(fallback);
  const hex = parsed ? formatHex(parsed) : undefined;
  const match = hex?.match(/^#([\da-f]{6})/i);
  if (!match) return [0.06, 0.09, 0.16];
  const value = match[1];
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255) as RGBColor;
}

function themeColor(element: HTMLElement, variable: string, fallback: string): string {
  const themeRoot = element.closest<HTMLElement>('.presentation-shell') ?? element;
  return window.getComputedStyle(themeRoot).getPropertyValue(variable).trim() || fallback;
}

function globeMarkers(markers: readonly GlobeCanvasMarker[], defaultColor: RGBColor): CobeMarker[] {
  return markers.map(({ location, size = 0.045, color, id }) => ({
    location: [location[0], location[1]],
    size,
    ...(color ? { color: toRgb(color, DEFAULT_COLORS.marker) } : { color: defaultColor }),
    ...(id ? { id } : {}),
  }));
}

function globeArcs(arcs: readonly GlobeCanvasArc[], defaultColor: RGBColor): CobeArc[] {
  return arcs.map(({ from, to, color, id }) => ({
    from: [from[0], from[1]],
    to: [to[0], to[1]],
    ...(color ? { color: toRgb(color, DEFAULT_COLORS.arc) } : { color: defaultColor }),
    ...(id ? { id } : {}),
  }));
}

/**
 * Lightweight WebGL globe from Cobe. It is imported only when mounted, adopts the
 * enclosing presentation's CSS theme colors, and pauses when motion is reduced or
 * the page is hidden. The small CSS sphere remains as a WebGL-unavailable fallback.
 */
export function GlobeCanvas({
  markers = EMPTY_MARKERS,
  arcs = EMPTY_ARCS,
  baseColor,
  markerColor,
  arcColor,
  glowColor,
  rotationSpeed = 0.08,
  ariaLabel = 'مجسم تفاعلي للكرة الأرضية',
  className,
}: GlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<CobeInstance | null>(null);
  const animationControlsRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const settingsRef = useRef({ markers, arcs, baseColor, markerColor, arcColor, glowColor, rotationSpeed });
  settingsRef.current = { markers, arcs, baseColor, markerColor, arcColor, glowColor, rotationSpeed };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.width = 560;
    canvas.height = 560;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'display:block;position:relative;z-index:10;width:100%;height:100%;opacity:0;transition:opacity 500ms;';
    container.appendChild(canvas);

    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    let frameId: number | null = null;
    let previousTime = 0;
    let phi = 0;
    let reduceMotion = prefersReducedMotion();
    let globe: CobeInstance | null = null;
    const mediaQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

    const stopAnimation = () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      previousTime = 0;
    };

    const drawFrame = (time: number) => {
      frameId = null;
      if (cancelled || reduceMotion || document.hidden || !globe) return;
      const elapsed = previousTime ? Math.min(time - previousTime, 50) : 0;
      previousTime = time;
      phi += (settingsRef.current.rotationSpeed * elapsed) / 1000;
      globe.update({ phi });
      frameId = window.requestAnimationFrame(drawFrame);
    };

    const startAnimation = () => {
      if (frameId === null && globe && !cancelled && !reduceMotion && !document.hidden && settingsRef.current.rotationSpeed !== 0) {
        frameId = window.requestAnimationFrame(drawFrame);
      }
    };
    animationControlsRef.current = { start: startAnimation, stop: stopAnimation };

    const onMotionChange = (event: MediaQueryListEvent) => {
      reduceMotion = event.matches;
      if (reduceMotion) stopAnimation();
      else startAnimation();
    };
    const onVisibilityChange = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };

    if (mediaQuery?.addEventListener) mediaQuery.addEventListener('change', onMotionChange);
    else mediaQuery?.addListener?.(onMotionChange);
    document.addEventListener('visibilitychange', onVisibilityChange);

    const getDimensions = () => {
      const size = Math.max(1, Math.round(container.clientWidth || 560));
      return { width: size, height: size };
    };

    const updateSize = () => {
      if (globe) globe.update(getDimensions());
    };

    const start = async () => {
      try {
        const webgl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
        if (!webgl) {
          if (!cancelled) setStatus('fallback');
          return;
        }

        const cobe = await import('cobe');
        if (cancelled) return;

        const current = settingsRef.current;
        const baseCss = current.baseColor ?? themeColor(container, '--presentation-surface-raised', DEFAULT_COLORS.base);
        const markerCss = current.markerColor ?? themeColor(container, '--presentation-accent', DEFAULT_COLORS.marker);
        const arcCss = current.arcColor ?? themeColor(container, '--presentation-secondary', DEFAULT_COLORS.arc);
        const glowCss = current.glowColor ?? themeColor(container, '--presentation-secondary', DEFAULT_COLORS.glow);
        const colors = {
          base: toRgb(baseCss, DEFAULT_COLORS.base),
          marker: toRgb(markerCss, DEFAULT_COLORS.marker),
          arc: toRgb(arcCss, DEFAULT_COLORS.arc),
          glow: toRgb(glowCss, DEFAULT_COLORS.glow),
        };
        const dimensions = getDimensions();

        globe = cobe.default(canvas, {
          ...dimensions,
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          phi,
          theta: 0.18,
          dark: 0.08,
          diffuse: 1.15,
          mapSamples: 10000,
          mapBrightness: 5,
          mapBaseBrightness: 0.12,
          baseColor: colors.base,
          markerColor: colors.marker,
          glowColor: colors.glow,
          arcColor: colors.arc,
          arcWidth: 0.45,
          arcHeight: 0.28,
          markerElevation: 0.045,
          markers: globeMarkers(current.markers, colors.marker),
          arcs: globeArcs(current.arcs, colors.arc),
        });
        globeRef.current = globe;
        canvas.style.opacity = '1';
        if (!cancelled) setStatus('ready');

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(updateSize);
          resizeObserver.observe(container);
        } else {
          window.addEventListener('resize', updateSize);
        }
        startAnimation();
      } catch {
        if (!cancelled) setStatus('fallback');
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopAnimation();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateSize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (mediaQuery?.removeEventListener) mediaQuery.removeEventListener('change', onMotionChange);
      else mediaQuery?.removeListener?.(onMotionChange);
      globe?.destroy();
      globeRef.current = null;
      animationControlsRef.current = null;
      const cobeHost = canvas.parentElement;
      if (cobeHost && cobeHost !== container && cobeHost.parentElement === container) cobeHost.remove();
      else canvas.remove();
    };
  }, []);

  useEffect(() => {
    if (rotationSpeed === 0) animationControlsRef.current?.stop();
    else animationControlsRef.current?.start();
  }, [rotationSpeed]);

  useEffect(() => {
    const globe = globeRef.current;
    const container = containerRef.current;
    if (!globe || !container) return;

    const current = settingsRef.current;
    const baseCss = current.baseColor ?? themeColor(container, '--presentation-surface-raised', DEFAULT_COLORS.base);
    const markerCss = current.markerColor ?? themeColor(container, '--presentation-accent', DEFAULT_COLORS.marker);
    const arcCss = current.arcColor ?? themeColor(container, '--presentation-secondary', DEFAULT_COLORS.arc);
    const glowCss = current.glowColor ?? themeColor(container, '--presentation-secondary', DEFAULT_COLORS.glow);
    const base = toRgb(baseCss, DEFAULT_COLORS.base);
    const marker = toRgb(markerCss, DEFAULT_COLORS.marker);
    const arc = toRgb(arcCss, DEFAULT_COLORS.arc);
    const glow = toRgb(glowCss, DEFAULT_COLORS.glow);

    globe.update({
      baseColor: base,
      markerColor: marker,
      arcColor: arc,
      glowColor: glow,
      markers: globeMarkers(current.markers, marker),
      arcs: globeArcs(current.arcs, arc),
    });
  }, [markers, arcs, baseColor, markerColor, arcColor, glowColor]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      aria-busy={status === 'loading'}
      data-globe-status={status}
      className={cn('relative mx-auto aspect-square w-full max-w-[30rem] overflow-hidden', className)}
    >
      {status !== 'ready' && (
        <div
          aria-hidden="true"
          className="absolute inset-[9%] overflow-hidden rounded-full border shadow-2xl"
          style={{
            borderColor: 'var(--presentation-border, rgba(255,255,255,.15))',
            backgroundColor: 'var(--presentation-surface, #0f172a)',
            background: 'radial-gradient(circle at 34% 26%, color-mix(in srgb, var(--presentation-secondary, #38bdf8) 30%, var(--presentation-surface-raised, #1e293b)) 0%, var(--presentation-surface, #0f172a) 67%, transparent 72%)',
            boxShadow: 'inset -22px -16px 38px rgba(0,0,0,.28), 0 18px 52px color-mix(in srgb, var(--presentation-accent, #fbbf24) 18%, transparent)',
          }}
        >
          <span className="absolute inset-y-[8%] left-[29%] w-[42%] rounded-[50%] border border-white/10" />
          <span className="absolute inset-x-[7%] top-[31%] h-[38%] rounded-[50%] border border-white/10" />
          <span className="absolute left-[31%] top-[39%] h-2 w-2 rounded-full bg-[var(--presentation-accent,#fbbf24)] shadow-[0_0_16px_var(--presentation-accent,#fbbf24)]" />
          <span className="absolute left-[57%] top-[54%] h-1.5 w-1.5 rounded-full bg-[var(--presentation-secondary,#38bdf8)] shadow-[0_0_14px_var(--presentation-secondary,#38bdf8)]" />
        </div>
      )}
    </div>
  );
}
