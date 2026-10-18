import { ChartColumn, CircleCheck, FileText, Info } from 'lucide-react';
import type { ChapterData } from '@/types/presentation';
import { Placeholder } from '@/components/ui';
import { ChapterPreface, ChapterSummary } from '@/components/archetypes';

/** الفصل 2 — نفس استمارة ch1.tsx (انظر التعليقات هناك). */
export const ch2: ChapterData = {
  id: 'ch2',
  title: 'عنوان الفصل الثاني',
  subtitle: 'السؤال الذي يجيب عنه هذا الفصل؟',
  icon: ChartColumn,
  color: 'from-violet-600/20 to-fuchsia-400/10',
  accent: 'text-violet-200 border-violet-400/40',
  slides: [
    {
      id: 'ch2-preface',
      chapterId: 'ch2',
      title: 'تمهيد الفصل الثاني',
      icon: Info,
      archetype: 'chapter-preface',
      content: (
        <ChapterPreface
          number={2}
          lead="جملة انتقال: بعد ما رأيناه في الفصل الأول، ننتقل إلى…"
          question="سؤال الفصل المشتق من الإشكالية؟"
          outline={['المحور الأول', 'المحور الثاني']}
        />
      ),
    },
    {
      id: 'ch2-slide-1',
      chapterId: 'ch2',
      title: 'المحور الأول',
      icon: FileText,
      archetype: 'placeholder',
      content: <Placeholder />,
    },
    {
      id: 'ch2-slide-2',
      chapterId: 'ch2',
      title: 'المحور الثاني',
      icon: FileText,
      archetype: 'placeholder',
      content: <Placeholder />,
    },
    {
      id: 'ch2-conclusion',
      chapterId: 'ch2',
      title: 'خلاصة الفصل الثاني',
      icon: CircleCheck,
      archetype: 'chapter-summary',
      content: (
        <ChapterSummary
          points={['النقطة الأولى.', 'النقطة الثانية.', 'النقطة الثالثة.']}
          answer="الإجابة المباشرة عن سؤال الفصل في جملة واحدة."
          nextHint="جسر إلى الفصل التالي."
        />
      ),
    },
  ],
};
