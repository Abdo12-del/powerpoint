import type { ChapterData } from '@/types/presentation';
import { ch1 } from './ch1';
import { ch2 } from './ch2';
import { ch3 } from './ch3';

/**
 * مصفوفة الفصول (3–5) — الخريطة والتنقل وشريط التقدّم تُبنى منها آلياً.
 * لإضافة فصل: انسخ ch3.tsx إلى ch4.tsx، غيّر id إلى 'ch4' (وبادئة معرفات شرائحه)، ثم أضفه هنا.
 */
export const chapters: ChapterData[] = [ch1, ch2, ch3];
