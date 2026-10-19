import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ConfettiPreset, ParticlesPreset } from './effects';

export type { ConfettiPreset, ParticlesPreset } from './effects';

/** ثيمات القالب العامة — كل وضع يضبط أدوار CSS مستقلة عن محتوى الشرائح. */
export type ThemeMode = 'dark' | 'light' | 'corporate';
export type ThemeBackdrop = 'aurora' | 'mesh' | 'grid' | 'noise' | 'none';

export interface PresentationThemeConfig {
  /** الوضع البصري: داكن افتراضياً، أو فاتح، أو مؤسسي. */
  mode?: ThemeMode;
  /** طبقة الخلفية الزخرفية؛ لا تؤثر في خلفية جسيمات شاشة العنوان. */
  backdrop?: ThemeBackdrop;
}

/** هوية الجامعة الاختيارية، تظهر كترويسة وذيل ثابتين فوق كل شاشة. */
export interface PresentationBranding {
  university?: string;
  unit?: string;
  /** مسار صورة الشعار (يفضّل ملفاً محلياً في public/branding/). */
  logoSrc?: string;
  logoAlt?: string;
  footer?: string;
}

/**
 * أنماط الشرائح المعيارية (§5 من المواصفة) + شريحتا حصر الفصل.
 * كل شريحة تُصنَّف أولاً إلى نمط ثم تُبنى — هذا يجعل الهيكل متوقّعاً لأي وكيل.
 */
export type SlideArchetype =
  | 'chapter-preface' // تمهيد الفصل (جملة انتقال)
  | 'chapter-summary' // خلاصة الفصل (3–5 نقاط)
  | 'profile' // 1. بطاقة تعريف
  | 'bullets' // 2. قائمة نقاط
  | 'timeline' // 3. خط زمني
  | 'tree' // 4. هيكل شجري
  | 'comparison' // 5. مقارنة زوجية
  | 'process' // 6. سير إجراء
  | 'table' // 7. جدول / بطاقات بيانات
  | 'relation' // 8. مخطط علائقي
  | 'code' // 9. كود / نموذج تقني
  | 'stats' // 10. إحصائيات / مؤشرات
  | 'placeholder'; // شريحة لم تُصنَّف بعد — هيكل فارغ ينتظر المحتوى (<Placeholder />)

/** عقد الشريحة — المستوى الثالث من الهرم (§4). */
export interface SlideData {
  /** معرف فريد ببادئة الفصل: "ch1-procedures" */
  id: string;
  /** الفصل المالك */
  chapterId: string;
  /** عنوان قصير (3–6 كلمات) — اسم وليس جملة */
  title: string;
  /** توضيح في سطر واحد (اختياري) */
  subtitle?: string;
  /** أيقونة تدل على نوع المحور (تظهر في الخريطة) */
  icon: LucideIcon;
  /** النمط المعياري للشريحة (§5) */
  archetype: SlideArchetype;
  /** كتل المحتوى */
  content: ReactNode;
  /** ملاحظات المُقدِّم (اختياري — لا تُعرض على الشاشة) */
  notes?: string;
}

/** عقد الفصل — المستوى الثاني من الهرم (§3). */
export interface ChapterData {
  /** معرف قصير يُستعمل كبادئة لمعرفات الشرائح: "ch1" */
  id: string;
  /** اسم معرفي: «الدراسة التمهيدية» */
  title: string;
  /** السؤال الذي يجيب عنه الفصل (اختياري) */
  subtitle?: string;
  icon: LucideIcon;
  /** لون أساس sRGB أو CSS؛ تُشتق منه ألوان الفصل المتناغمة بواسطة Culori. */
  brandColor?: string;
  /** أصناف تدرّج Tailwind القديمة (احتياط للتوافق مع بيانات العروض الموجودة). */
  color: string;
  /** أصناف لون التمييز القديمة (احتياط للتوافق مع بيانات العروض الموجودة). */
  accent: string;
  slides: SlideData[];
}

/** مجموعة أسماء بدور واحد: «إعداد: …» / «إشراف: …» */
export interface AuthorGroup {
  role: string;
  names: string[];
}

/** بطاقة تعريف العرض — شاشة العنوان (§2.1). */
export interface PresentationMeta {
  /** سطور الجهة الرسمية من الأعم إلى الأخص */
  organization: string[];
  /** طبيعة المشروع: «مذكرة تخرج» / «تقرير سنوي» */
  workType: string;
  /** جملة واحدة تصف المشروع */
  title: string;
  /** توضيح أو مكان التطبيق */
  subtitle?: string;
  authors: AuthorGroup[];
  /** التاريخ / الدفعة */
  date: string;
  /** نص زر البدء — الافتراضي «اضغط للبدء» */
  startLabel?: string;
  /** خلفية جسيمات متحركة لشاشة العنوان ('none' أو بدون الحقل = لا شيء) */
  background?: ParticlesPreset | 'none';
}

/** نوع خطوة المقدمة (§2.2) */
export type PrefaceKind = 'context' | 'problem' | 'objectives' | 'scope';

/** خطوة من خطوات المقدمة — كل خطوة شريحة كاملة. */
export interface PrefaceStep {
  id: string;
  kind: PrefaceKind;
  title: string;
  icon: LucideIcon;
  content: ReactNode;
}

/** الخاتمة النهائية (§2.5) — تلخّص فقط، لا معلومات جديدة. */
export interface FinalData {
  title: string;
  /** خلاصة العرض في 3–4 جمل */
  summary: string[];
  /** نتيجة / دعوة تأمل */
  closing: string;
  /** شكر / أسئلة */
  thanks: string;
  /** قصاصات احتفالية عند الوصول إلى الخاتمة: true = 'cannons'، أو اسم إعداد مسبق، أو false */
  celebrate?: boolean | ConfettiPreset;
}

/** العرض الكامل — رأس الهرم. */
export interface PresentationData {
  meta: PresentationMeta;
  /** الوضع العام والخلفية الزخرفية (اختياريان؛ الافتراضي داكن/aurora). */
  theme?: PresentationThemeConfig;
  /** شعار الجامعة والجهة والذيل الثابت؛ لا يظهر شيء عند تركه فارغاً. */
  branding?: PresentationBranding;
  preface: PrefaceStep[];
  chapters: ChapterData[];
  final: FinalData;
}
