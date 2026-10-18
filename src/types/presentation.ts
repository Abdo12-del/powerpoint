import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

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
  /** أصناف تدرّج Tailwind للخلفية: 'from-blue-600/20 to-blue-400/20' */
  color: string;
  /** أصناف لون التمييز (نص/حدود): 'text-blue-300 border-blue-400/40' */
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
}

/** العرض الكامل — رأس الهرم. */
export interface PresentationData {
  meta: PresentationMeta;
  preface: PrefaceStep[];
  chapters: ChapterData[];
  final: FinalData;
}
