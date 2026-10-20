/**
 * خريطة مفاتيح التحكم (§6 — عقد التحكم الإلزامي).
 * تُعدَّل من هنا فقط؛ الشاشات وشريط التحكم يقرآن منها.
 *
 * ملاحظة: الأحرف العربية المضافة هي ما تنتجه نفس المفاتيح الفيزيائية
 * على لوحة المفاتيح العربية (m ⇄ ة، f ⇄ ب، h ⇄ ا)، حتى لا يحتاج المُقدِّم لتبديل اللغة.
 */
export const KEYS: Record<
  | 'next'
  | 'prev'
  | 'map'
  | 'escape'
  | 'fullscreen'
  | 'help'
  | 'annotate'
  | 'chalkboard'
  | 'clearDrawing'
  | 'spotlight'
  | 'laser'
  | 'zoomToggle',
  readonly string[]
> = {
  next: ['ArrowRight', 'Enter', ' ', 'PageDown'],
  prev: ['ArrowLeft', 'PageUp', 'Backspace'],
  map: ['ArrowDown', 'm', 'M', 'ة'],
  escape: ['Escape'],
  fullscreen: ['f', 'F', 'ب'],
  help: ['?', 'h', 'H', 'ا', '؟'],
  // السبورة والتعليق (بمفاتيح إضافة reveal.js-plugins: C للتعليق وB للسبورة — وحروفها العربية)
  annotate: ['c', 'C', 'ؤ'],
  chalkboard: ['b', 'B', 'لا'],
  clearDrawing: ['Delete'],
  // التكبير والتركيز (نموذج إضافة zoom المدمجة مع reveal.js: Alt+Click، وZ للتوسيط — وحروفها العربية)
  zoomToggle: ['z', 'Z', 'ئ'],
  spotlight: ['s', 'S', 'س'],
  laser: ['l', 'L', 'م'],
};

/** تسميات الاختصارات كما تظهر في نافذة المساعدة. */
export const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['→', 'Enter', 'Space'], label: 'الشريحة التالية' },
  { keys: ['←'], label: 'الشريحة السابقة' },
  { keys: ['↓', 'M', 'Esc'], label: 'خريطة الفصول' },
  { keys: ['Esc'], label: 'من الخريطة: العودة لشاشة العنوان' },
  { keys: ['F'], label: 'ملء الشاشة' },
  { keys: ['?', 'H'], label: 'هذه النافذة' },
  { keys: ['C'], label: 'التعليق فوق الشريحة' },
  { keys: ['B'], label: 'سبورة مستقلة' },
  { keys: ['Delete'], label: 'مسح الرسم (أثناء التعليق/السبورة)' },
  { keys: ['Alt + Click'], label: 'تكبير نحو نقطة الشرح (نقر ثانٍ للخروج)' },
  { keys: ['Z'], label: 'تكبير/خروج (مركزي)' },
  { keys: ['S'], label: 'تسليط الضوء على موضع الشرح' },
  { keys: ['L'], label: 'مؤشر ليزر' },
];

/** الحد الأدنى لمسافة السحب باللمس (بكسل) لاعتباره تنقّلاً. */
export const SWIPE_THRESHOLD = 60;
