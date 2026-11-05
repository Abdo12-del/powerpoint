/**
 * هندسة العناصر المُدرجة — دوال نقية قابلة للاختبار.
 * كل الإحداثيات كسور (0..1) من مستطيل الشريحة، لا بكسلات الشاشة،
 * حتى يبقى الموضع والحجم صحيحين عند تغيير حجم العارض أو التكبير.
 */
import { DEFAULT_WIDTH, MAX_WIDTH, MIN_WIDTH } from './types';
import type { EquipmentAsset, PlacedEquipment } from './types';

/** مستطيل حاوية الشريحة بالبكسل (من getBoundingClientRect) */
export interface SlideRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** أبعاد اسمية 16:9 تُستعمل قبل توفر حاوية حقيقية (الإضافة من اللوحة مثلاً) */
export const NOMINAL_RECT: SlideRect = { left: 0, top: 0, width: 1600, height: 900 };

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** تقريب إلى 4 منازل (دقة 0.01%) — يمنع ضجيج الفاصلة العائمة في التخزين والعرض */
function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}

/** نسبة أبعاد الأصل (عرض ÷ ارتفاع) */
export function assetAspect(asset: EquipmentAsset): number {
  return asset.width / asset.height;
}

/** ارتفاع العنصر ككسر من ارتفاع الشريحة — يُشتق من العرض ونسبة الأصل */
export function heightFraction(w: number, asset: EquipmentAsset, rect: SlideRect): number {
  if (rect.width <= 0 || rect.height <= 0) return 0;
  return (w * rect.width) / assetAspect(asset) / rect.height;
}

/** نقطة بكسلية (حدث مؤشر/إفلات) → إحداثيات نسبية داخل الشريحة */
export function relativePoint(clientX: number, clientY: number, rect: SlideRect): { x: number; y: number } {
  return {
    x: rect.width > 0 ? (clientX - rect.left) / rect.width : 0,
    y: rect.height > 0 ? (clientY - rect.top) / rect.height : 0,
  };
}

/** تثبيت موضع داخل حدود الشريحة مع مراعاة الارتفاع المشتق */
export function clampPlacement(
  x: number,
  y: number,
  w: number,
  asset: EquipmentAsset,
  rect: SlideRect,
): { x: number; y: number } {
  const h = heightFraction(w, asset, rect);
  return {
    x: round(clamp(x, 0, Math.max(0, 1 - w))),
    y: round(clamp(y, 0, Math.max(0, 1 - h))),
  };
}

/**
 * موضع عنصر جديد ممركز حول نقطة نسبية (موضع الإفلات أو مركز الشريحة).
 * يُثبَّت داخل الحدود فلا يسقط أي جزء خارج الشريحة.
 */
export function placeEquipment(
  asset: EquipmentAsset,
  center: { x: number; y: number } = { x: 0.5, y: 0.45 },
  rect: SlideRect = NOMINAL_RECT,
  w: number = DEFAULT_WIDTH,
): Pick<PlacedEquipment, 'x' | 'y' | 'w'> {
  const width = clamp(w, MIN_WIDTH, MAX_WIDTH);
  const h = heightFraction(width, asset, rect);
  const { x, y } = clampPlacement(center.x - width / 2, center.y - h / 2, width, asset, rect);
  return { x, y, w: width };
}

/**
 * عرض جديد أثناء تحجيم بمقبض الزاوية — الحافة اليسرى ثابتة،
 * ونسبة الأبعاد محفوظة دائماً (الارتفاع مشتق). يُحدّ بالحدود
 * الدنيا/القصوى وبالحافتين اليمنى والسفلى للشريحة.
 */
export function widthFromPointer(
  item: Pick<PlacedEquipment, 'x' | 'y'>,
  clientX: number,
  asset: EquipmentAsset,
  rect: SlideRect,
): number {
  if (rect.width <= 0 || rect.height <= 0) return MIN_WIDTH;
  const raw = (clientX - rect.left) / rect.width - item.x;
  const maxByRight = 1 - item.x;
  const maxByBottom = ((1 - item.y) * rect.height * assetAspect(asset)) / rect.width;
  return round(clamp(raw, MIN_WIDTH, Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, maxByRight, maxByBottom))));
}
