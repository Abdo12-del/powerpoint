import { CircleCheck, FileText, Info, Rocket } from 'lucide-react';
import type { ChapterData } from '@/types/presentation';
import { Placeholder } from '@/components/ui';
import { ChapterPreface, ChapterSummary } from '@/components/archetypes';

/** الفصل 3 — نفس استمارة ch1.tsx. الفصل الأخير بلا nextHint في خلاصته. */
export const ch3: ChapterData = {
  id: 'ch3',
  title: 'عنوان الفصل الثالث',
  subtitle: 'السؤال الذي يجيب عنه هذا الفصل؟',
  icon: Rocket,
  color: 'from-emerald-600/20 to-teal-400/10',
  accent: 'text-emerald-200 border-emerald-400/40',
  slides: [
    {
      id: 'ch3-preface',
      chapterId: 'ch3',
      title: 'تمهيد الفصل الثالث',
      icon: Info,
      archetype: 'chapter-preface',
      content: (
        <ChapterPreface
          number={3}
          lead="جملة انتقال: بعد تحديد الحل، يبقى السؤال العملي…"
          question="سؤال الفصل المشتق من الإشكالية؟"
          outline={['المحور الأول', 'المحور الثاني']}
        />
      ),
    },
    {
      id: 'ch3-slide-1',
      chapterId: 'ch3',
      title: 'المحور الأول',
      icon: FileText,
      archetype: 'placeholder',
      content: <Placeholder />,
    },
    {
      id: 'ch3-slide-2',
      chapterId: 'ch3',
      title: 'المحور الثاني',
      icon: FileText,
      archetype: 'placeholder',
      content: <Placeholder />,
    },
    {
      id: 'ch3-conclusion',
      chapterId: 'ch3',
      title: 'خلاصة الفصل الثالث',
      icon: CircleCheck,
      archetype: 'chapter-summary',
      content: (
        <ChapterSummary
          points={['النقطة الأولى.', 'النقطة الثانية.', 'النقطة الثالثة.']}
          answer="الإجابة المباشرة عن سؤال الفصل في جملة واحدة."
        />
      ),
    },
  ],
};
