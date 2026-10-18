import type { ChapterData } from '@/types/presentation';
import { ch1 } from './ch1';
import { ch2 } from './ch2';
import { ch3 } from './ch3';

/** مصفوفة الفصول — الخريطة والتنقل يُبنيان منها آلياً. */
export const chapters: ChapterData[] = [ch1, ch2, ch3];
