import { CircleCheck, FileText, Info, Layers } from 'lucide-react';
import type { ChapterData } from '@/types/presentation';
import { Placeholder } from '@/components/ui';
import { ChapterPreface, ChapterSummary } from '@/components/archetypes';

/**
 * الفصل 1 — «استمارة» فصل. القواعد (§3–§4):
 * - الفصل يجيب عن سؤال واحد من الإشكالية؛ عنوانه اسم معرفي («الدراسة التمهيدية»).
 * - 4–8 شرائح: يفتتح بـ ChapterPreface ويُختتم بـ ChapterSummary.
 * - كل شريحة: id ببادئة الفصل (ch1-…)، عنوان من 3–6 كلمات، نمط واحد من العشرة.
 * - لإضافة شريحة: انسخ كتلة «المحور» وغيّر id/title/icon/archetype واستبدل <Placeholder />.
 */
export const ch1: ChapterData = {
  id: 'ch1',
  title: 'عنوان الفصل الأول',
  subtitle: 'السؤال الذي يجيب عنه هذا الفصل؟',
  icon: Layers,
  color: 'from-sky-600/20 to-sky-400/10',
  accent: 'text-sky-200 border-sky-400/40',
  slides: [
    {
      id: 'ch1-preface',
      chapterId: 'ch1',
      title: 'تمهيد الفصل الأول',
      icon: Info,
      archetype: 'chapter-preface',
      content: (
        <ChapterPreface
          number={1}
          lead="جملة انتقال تمهّد لهذا الفصل: ماذا سنفعل فيه ولماذا نبدأ به؟"
          question="سؤال الفصل المشتق من الإشكالية؟"
          outline={['المحور الأول', 'المحور الثاني']}
        />
      ),
    },

    // ── المحور 1 ─────────────────────────────────────────────────────────
    {
      id: 'ch1-slide-1',
      chapterId: 'ch1',
      title: 'المحور الأول',
      subtitle: 'توضيح في سطر واحد (اختياري)',
      icon: FileText,
      archetype: 'placeholder', // ← غيّره إلى نمط من العشرة: 'profile' | 'bullets' | 'timeline' | …
      content: <Placeholder />,
    },

    // ── المحور 2 ─────────────────────────────────────────────────────────
    {
      id: 'ch1-slide-2',
      chapterId: 'ch1',
      title: 'المحور الثاني',
      icon: FileText,
      archetype: 'placeholder',
      content: <Placeholder />,
    },

    {
      id: 'ch1-conclusion',
      chapterId: 'ch1',
      title: 'خلاصة الفصل الأول',
      icon: CircleCheck,
      archetype: 'chapter-summary',
      content: (
        <ChapterSummary
          points={['النقطة الأولى (جملة واحدة ≤ 12 كلمة).', 'النقطة الثانية.', 'النقطة الثالثة.']}
          answer="الإجابة المباشرة عن سؤال الفصل في جملة واحدة."
          nextHint="جسر إلى الفصل التالي: ما الذي سيبني عليه؟"
        />
      ),
    },
  ],
};
