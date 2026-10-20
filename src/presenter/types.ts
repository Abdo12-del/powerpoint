/**
 * أنواع وثوابت حزمة ملاحظات المعلم ومؤقت العرض — Presenter Notes & Timer
 * نموذج إضافة Reveal Notes المدمجة مع reveal.js (MIT):
 * نافذة معلم منفصلة تعرض معاينة الشريحة الحالية والتالية + الملاحظات الخاصة
 * + مؤقتاً للوقت المنقضي + تنقّلاً متزامناً — والملاحظات مخفية عن الطلاب دائماً.
 */

/** فاصل تحديث المؤقت (ms) — نصف ثانية كافية لعرض mm:ss */
export const TIMER_TICK_MS = 500;

/** أبعاد معاينة الشريحة المنطقية (نسبة 16:9) — تُصيَّر حقيقية ثم تُصغَّر بـ transform */
export const PREVIEW_W = 1280;
export const PREVIEW_H = 720;
/** عرض المعاينة الحالية والتالية (بكسل CSS) في نافذة المعلم */
export const PREVIEW_CURRENT_W = 620;
export const PREVIEW_NEXT_W = 300;

/** اسم نافذة المعلم (هدف window.open — يعيد التركيز للنافذة نفسها عند فتحها ثانية) */
export const PRESENTER_WINDOW_NAME = 'db-presenter';
/** مقاسات نافذة المعلم */
export const PRESENTER_WINDOW_FEATURES = 'popup=yes,width=1120,height=800';

/** نص بديل حين تكون الملاحظات فارغة (القالب الأبيض) */
export const EMPTY_NOTES_HINT = 'بلا ملاحظات لهذه الشاشة — أضف notes إلى بياناتها فتظهر هنا فقط.';
