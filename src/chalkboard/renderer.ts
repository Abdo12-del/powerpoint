/**
 * مصيّر السبورة — رسم الخطوط على Canvas2D
 * الطباشير/الماركر: خط أملس بتقنية نقاط المنتصف (quadratic midpoint)
 * الممحاة: تشطيب destination-out (تعمل على التعليق والسبورة على السواء)
 */

import { ERASER_SCALE } from './types';
import type { ChalkPoint, ChalkStroke } from './types';

/** إعداد سياق الرسم لأداة معيّنة — يُرجع السُمك الفعلي */
function applyTool(ctx: CanvasRenderingContext2D, stroke: ChalkStroke): number {
  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 1;
    return stroke.size * ERASER_SCALE;
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  return stroke.size;
}

/** رسم نقطة واحدة (نقطة) */
function drawDot(ctx: CanvasRenderingContext2D, p: ChalkPoint, radius: number): void {
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius / 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * رسم خطّة كاملة على السياق — بإحداثيات بكسل CSS مباشرة
 * (المُستدعي يضبط تحويل DPR عبر setTransform)
 */
export function drawStroke(ctx: CanvasRenderingContext2D, stroke: ChalkStroke): void {
  if (!ctx || stroke.points.length === 0) return;
  const width = applyTool(ctx, stroke);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = width;

  if (stroke.points.length === 1) {
    drawDot(ctx, stroke.points[0], width);
    return;
  }

  ctx.beginPath();
  const first = stroke.points[0];
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < stroke.points.length - 1; i++) {
    const cur = stroke.points[i];
    const next = stroke.points[i + 1];
    ctx.quadraticCurveTo(cur.x, cur.y, (cur.x + next.x) / 2, (cur.y + next.y) / 2);
  }
  const last = stroke.points[stroke.points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

/** رسم قائمة خطوط بالترتيب — إعادة الرسم الكاملة بعد تراجع/مسح/تغيير مقاس */
export function renderStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: readonly ChalkStroke[],
): void {
  if (!ctx) return;
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const stroke of strokes) drawStroke(ctx, stroke);
  ctx.globalCompositeOperation = 'source-over';
}

/** قصّ سفلي بسيط لضغط عدد نقاط الخطّة (يبقى الشكل سليماً بصرياً) */
export function simplifyPoints(points: ChalkPoint[], minDistance = 1.2): ChalkPoint[] {
  if (points.length <= 2) return points;
  const out: ChalkPoint[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = out[out.length - 1];
    const cur = points[i];
    if (Math.hypot(cur.x - prev.x, cur.y - prev.y) >= minDistance) out.push(cur);
  }
  out.push(points[points.length - 1]);
  return out;
}

/**
 * تصدير طبقة كصورة PNG — خلفية اختيارية (لون السبورة) وإلا شفافة
 * يُرجع dataURL أو undefined عند فشل بيئات بلا Canvas
 */
export function strokesToPNG(
  strokes: readonly ChalkStroke[],
  width = 1600,
  height = 900,
  background?: string,
): string | undefined {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    }
    for (const stroke of strokes) drawStroke(ctx, stroke);
    return canvas.toDataURL('image/png');
  } catch {
    return undefined;
  }
}

/** تنزيل dataURL كملف — بلا رميات (بيئات بلا DOM تحمّل الصمت) */
export function downloadDataURL(dataURL: string, filename: string): void {
  try {
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = filename;
    a.click();
  } catch {
    /* تجاهل */
  }
}
