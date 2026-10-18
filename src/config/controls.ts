/**
 * خريطة مفاتيح التحكم (§6 — عقد التحكم الإلزامي).
 * تُعدَّل من هنا فقط؛ الشاشات وشريط التحكم يقرآن منها.
 *
 * ملاحظة: الأحرف العربية المضافة هي ما تنتجه نفس المفاتيح الفيزيائية
 * على لوحة المفاتيح العربية (m ⇄ ة، f ⇄ ب، h ⇄ ا)، حتى لا يحتاج المُقدِّم لتبديل اللغة.
 */
export const KEYS: Record<'next' | 'prev' | 'map' | 'escape' | 'fullscreen' | 'help', readonly string[]> = {
  next: ['ArrowRight', 'Enter', ' ', 'PageDown'],
  prev: ['ArrowLeft', 'PageUp', 'Backspace'],
  map: ['ArrowDown', 'm', 'M', 'ة'],
  escape: ['Escape'],
  fullscreen: ['f', 'F', 'ب'],
  help: ['?', 'h', 'H', 'ا', '؟'],
};

/** تسميات الاختصارات كما تظهر في نافذة المساعدة. */
export const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['→', 'Enter', 'Space'], label: 'الشريحة التالية' },
  { keys: ['←'], label: 'الشريحة السابقة' },
  { keys: ['↓', 'M', 'Esc'], label: 'خريطة الفصول' },
  { keys: ['Esc'], label: 'من الخريطة: العودة لشاشة العنوان' },
  { keys: ['F'], label: 'ملء الشاشة' },
  { keys: ['?', 'H'], label: 'هذه النافذة' },
];

/** الحد الأدنى لمسافة السحب باللمس (بكسل) لاعتباره تنقّلاً. */
export const SWIPE_THRESHOLD = 60;
