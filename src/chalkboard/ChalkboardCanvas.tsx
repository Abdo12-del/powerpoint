import { useCallback, useEffect, useRef } from 'react';
import { drawStroke, renderStrokes, simplifyPoints } from './renderer';
import { ERASER_SCALE } from './types';
import type { ChalkPoint, ChalkStroke } from './types';

export interface ChalkboardCanvasProps {
  /** الخطوط الملتزمة (من المخزن) — تُعاد رسمها كاملة عند تغيّرها */
  strokes: readonly ChalkStroke[];
  /** إعداد الخطّة الجديدة الملتقطة من المؤشر */
  getStroke: () => Pick<ChalkStroke, 'tool' | 'color' | 'size'>;
  /** التزام خطّة مكتملة */
  onCommit: (stroke: ChalkStroke) => void;
  /** هل تلتقط المؤشر؟ (الوضع مغلق: عرض فقط) */
  interactive: boolean;
  className?: string;
  /** مؤشر مخصص بحجم الأداة */
  cursorColor?: string;
  cursorSize?: number;
  onDirty?: () => void;
}

/**
 * لوحة قماشية للرسم الحر — طبقة واحدة فوق المحتوى
 * الرسم التزايدي أثناء السحب (بلا إعادة رسم React) وإعادة رسم كاملة عند التراجع/المسح/القياس
 */
export function ChalkboardCanvas({
  strokes,
  getStroke,
  onCommit,
  interactive,
  className,
  cursorColor = '#f8fafc',
  cursorSize = 8,
}: ChalkboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<ChalkStroke | null>(null);
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const getStrokeRef = useRef(getStroke);
  getStrokeRef.current = getStroke;

  /** ضبط المقاس بمقياس الشاشة وإعادة الرسم الكاملة */
  const resizeAndRender = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return; // بيئات بلا Canvas — صمت تام
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderStrokes(ctx, strokesRef.current);
  }, []);

  useEffect(() => {
    resizeAndRender();
  }, [strokes, resizeAndRender]);

  useEffect(() => {
    resizeAndRender();
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => resizeAndRender());
      ro.observe(canvas);
    }
    window.addEventListener('resize', resizeAndRender);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', resizeAndRender);
    };
  }, [resizeAndRender]);

  /** إحداثيات المؤشر بإحداثيات اللوحة المنطقية */
  const pointFrom = useCallback((e: PointerEvent | React.PointerEvent): ChalkPoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!interactive) return;
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return; // بلا سياق — لا رسم
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const base = getStrokeRef.current();
      liveRef.current = { ...base, points: [pointFrom(e)] };
      drawStroke(ctx, liveRef.current);
    },
    [interactive, pointFrom],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const live = liveRef.current;
      if (!live) return;
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const p = pointFrom(e);
      const prev = live.points[live.points.length - 1];
      live.points.push(p);
      // رسم تزايدي: مقطع من النقطة السابقة إلى الحالية — بلا إعادة رسم كاملة
      const seg: ChalkStroke = { ...live, points: simplifyPoints([prev, p], 0.01) };
      drawStroke(ctx, seg);
    },
    [pointFrom],
  );

  const endStroke = useCallback(() => {
    const live = liveRef.current;
    if (!live) return;
    liveRef.current = null;
    live.points = simplifyPoints(live.points);
    onCommit(live);
  }, [onCommit]);

  const eraserActive = getStroke().tool === 'eraser';
  const cursor = `${cursorSize * (eraserActive ? ERASER_SCALE : 1)}px`;

  return (
    <canvas
      ref={canvasRef}
      data-testid="chalkboard-canvas"
      className={className ?? 'absolute inset-0 h-full w-full touch-none'}
      style={{
        cursor: interactive ? `crosshair` : 'default',
        pointerEvents: interactive ? 'auto' : 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
      onPointerLeave={endStroke}
      data-cursor-size={cursor}
      data-cursor-color={cursorColor}
    />
  );
}
