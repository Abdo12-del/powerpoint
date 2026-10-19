import { ChartColumn, CircleCheck, FileText, Info } from 'lucide-react';
import type { ChapterData } from '@/types/presentation';

/** الفصل 2 — نفس استمارة ch1.tsx (انظر التعليقات هناك). */
export const ch2: ChapterData = {
  id: 'ch2',
  title: '',
  icon: ChartColumn,
  brandColor: '#a855f7',
  color: 'from-violet-600/20 to-fuchsia-400/10',
  accent: 'text-violet-200 border-violet-400/40',
  slides: [
    {
      id: 'ch2-preface',
      chapterId: 'ch2',
      title: '',
      icon: Info,
      archetype: 'chapter-preface',
      content: null,
    },
    {
      id: 'ch2-slide-1',
      chapterId: 'ch2',
      title: '',
      icon: FileText,
      archetype: 'placeholder',
      content: null,
    },
    {
      id: 'ch2-slide-2',
      chapterId: 'ch2',
      title: '',
      icon: FileText,
      archetype: 'placeholder',
      content: null,
    },
    {
      id: 'ch2-conclusion',
      chapterId: 'ch2',
      title: '',
      icon: CircleCheck,
      archetype: 'chapter-summary',
      content: null,
    },
  ],
};
