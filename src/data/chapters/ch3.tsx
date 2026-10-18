import { CircleCheck, FileText, Info, Rocket } from 'lucide-react';
import type { ChapterData } from '@/types/presentation';

/** الفصل 3 — نفس استمارة ch1.tsx. الفصل الأخير بلا nextHint في خلاصته. */
export const ch3: ChapterData = {
  id: 'ch3',
  title: '',
  icon: Rocket,
  color: 'from-emerald-600/20 to-teal-400/10',
  accent: 'text-emerald-200 border-emerald-400/40',
  slides: [
    {
      id: 'ch3-preface',
      chapterId: 'ch3',
      title: '',
      icon: Info,
      archetype: 'chapter-preface',
      content: null,
    },
    {
      id: 'ch3-slide-1',
      chapterId: 'ch3',
      title: '',
      icon: FileText,
      archetype: 'placeholder',
      content: null,
    },
    {
      id: 'ch3-slide-2',
      chapterId: 'ch3',
      title: '',
      icon: FileText,
      archetype: 'placeholder',
      content: null,
    },
    {
      id: 'ch3-conclusion',
      chapterId: 'ch3',
      title: '',
      icon: CircleCheck,
      archetype: 'chapter-summary',
      content: null,
    },
  ],
};
