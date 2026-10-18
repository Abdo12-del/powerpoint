/** هل يفضّل المستخدم تقليل الحركة؟ (كل المؤثرات الثقيلة تحترم هذا الإعداد) */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
