/**
 * تأثير Morphing — تحويل الأشكال الهندسية بسلاسة
 * يستخدم interpolating بين مسارات SVG
 */

export interface MorphShape {
  id: string;
  path: string;
  color: string;
  label: string;
}

export const MORPH_SHAPES: MorphShape[] = [
  { id: 'circle', path: 'M 50 10 A 40 40 0 1 1 50 90 A 40 40 0 1 1 50 10 Z', color: '#fbbf24', label: 'دائرة' },
  { id: 'square', path: 'M 14 14 H 86 V 86 H 14 Z', color: '#38bdf8', label: 'مربع' },
  { id: 'triangle', path: 'M 50 12 L 88 86 L 12 86 Z', color: '#a78bfa', label: 'مثلث' },
  { id: 'hexagon', path: 'M 50 8 L 85 28 L 85 72 L 50 92 L 15 72 L 15 28 Z', color: '#34d399', label: 'مسدس' },
  { id: 'star', path: 'M 50 8 L 61 36 L 92 36 L 67 54 L 76 84 L 50 66 L 24 84 L 33 54 L 8 36 L 39 36 Z', color: '#fb7185', label: 'نجمة' },
  { id: 'diamond', path: 'M 50 6 L 94 50 L 50 94 L 6 50 Z', color: '#f472b6', label: 'معين' },
];

/**
 * دالة استيفاء خطية بين نقطتين في مسار SVG (تقريب مبسط)
 * للـ production الحقيقي يُستعمل flubber أو gsap morphSVG
 */
export function interpolatePaths(from: string, to: string, t: number): string {
  // استخراج الأرقام من المسارين
  const numsFrom = (from.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  const numsTo = (to.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  if (numsFrom.length !== numsTo.length) return t < 0.5 ? from : to;

  let idx = 0;
  return from.replace(/-?\d*\.?\d+/g, () => {
    const v = numsFrom[idx] + (numsTo[idx] - numsFrom[idx]) * t;
    idx++;
    return String(Math.round(v * 10) / 10);
  });
}

/**
 * يحرك morph تلقائياً بين الأشكال كل مدة محددة
 */
export function startMorphLoop(
  pathEl: SVGPathElement,
  shapes: MorphShape[] = MORPH_SHAPES,
  durationMs = 700,
  holdMs = 900,
  onShapeChange?: (shape: MorphShape) => void,
): () => void {
  let idx = 0;
  let raf = 0;
  let startTime = performance.now();
  let phase: 'hold' | 'morph' = 'hold';
  let holdStart = startTime;

  const tick = (now: number) => {
    if (phase === 'hold') {
      if (now - holdStart >= holdMs) {
        phase = 'morph';
        startTime = now;
      }
    } else {
      const t = Math.min((now - startTime) / durationMs, 1);
      // ease in-out
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const from = shapes[idx].path;
      const to = shapes[(idx + 1) % shapes.length].path;
      pathEl.setAttribute('d', interpolatePaths(from, to, eased));

      // لون متدرج
      const c = interpolateColor(shapes[idx].color, shapes[(idx + 1) % shapes.length].color, eased);
      pathEl.setAttribute('fill', c);

      if (t >= 1) {
        idx = (idx + 1) % shapes.length;
        onShapeChange?.(shapes[idx]);
        phase = 'hold';
        holdStart = now;
      }
    }
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

function interpolateColor(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  if (!pa || !pb) return a;
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const b2 = Math.round(pa.b + (pb.b - pa.b) * t);
  return `rgb(${r},${g},${b2})`;
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '');
  if (m.length !== 6) return null;
  return { r: parseInt(m.slice(0, 2), 16), g: parseInt(m.slice(2, 4), 16), b: parseInt(m.slice(4, 6), 16) };
}
