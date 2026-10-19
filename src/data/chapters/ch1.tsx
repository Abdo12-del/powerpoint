import { CircleCheck, FileText, Info, Layers } from 'lucide-react';
import type { ChapterData } from '@/types/presentation';

/**
 * الفصل 1 — «استمارة» فصل بيضاء. القواعد (§3–§4):
 * - الفصل يجيب عن سؤال واحد من الإشكالية؛ عنوانه اسم معرفي («الدراسة التمهيدية»).
 * - 4–8 شرائح: يفتتح بـ chapter-preface ويُختتم بـ chapter-summary.
 * - كل شريحة: id ببادئة الفصل (ch1-…)، عنوان من 3–6 كلمات، نمط واحد من العشرة.
 * - الشريحة البيضاء = title فارغ و content: null — رأسها وشاراتها لا تظهر حتى تكتب العنوان.
 * - لإضافة شريحة: انسخ كتلة «المحور» وغيّر id/title/icon/archetype وضع المحتوى مكان null.
 *
 * مثال تعبئة شريحة التمهيد:
 *   title: 'تمهيد الفصل الأول',
 *   content: <ChapterPreface number={1} lead="جملة انتقال…" question="سؤال الفصل؟" outline={['المحور الأول', 'المحور الثاني']} />
 * ومثال خلاصة الفصل:
 *   content: <ChapterSummary points={['…', '…', '…']} answer="الإجابة عن سؤال الفصل." nextHint="جسر إلى الفصل التالي." />
 * (الاستيراد: import { ChapterPreface, ChapterSummary } from '@/components/archetypes';)
 */
export const ch1: ChapterData = {
  id: 'ch1',
  title: '', // اسم معرفي: 'الدراسة التمهيدية'
  // subtitle: 'السؤال الذي يجيب عنه هذا الفصل؟',
  icon: Layers,
  brandColor: '#0ea5e9', // Culori يشتق درجات متناسقة بحسب سمة العرض
  color: 'from-sky-600/20 to-sky-400/10',
  accent: 'text-sky-200 border-sky-400/40',
  slides: [
    {
      id: 'ch1-preface',
      chapterId: 'ch1',
      title: '',
      icon: Info,
      archetype: 'chapter-preface',
      content: null,
    },

    // ── المحور 1 ─────────────────────────────────────────────────────────
    {
      id: 'ch1-slide-1',
      chapterId: 'ch1',
      title: '', // 3–6 كلمات
      // subtitle: 'توضيح في سطر واحد (اختياري)',
      icon: FileText,
      archetype: 'placeholder', // ← غيّره إلى نمط من العشرة: 'profile' | 'bullets' | 'timeline' | …
      content: null, // ← مكوّن النمط من '@/components/archetypes' أو وصفة من '@/recipes'
    },

    // ── المحور 2 ─────────────────────────────────────────────────────────
    {
      id: 'ch1-slide-2',
      chapterId: 'ch1',
      title: '',
      icon: FileText,
      archetype: 'placeholder',
      content: null,
    },

    {
      id: 'ch1-conclusion',
      chapterId: 'ch1',
      title: '',
      icon: CircleCheck,
      archetype: 'chapter-summary',
      content: null,
    },
  ],
};
