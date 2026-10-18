import type { TypographyConfig } from '@/fonts';

/**
 * إعدادات الخطوط لهذا العرض — غيّر `preset` أو تجاوز دوراً بعينه.
 * الاقترانات المتاحة: default | academic | modern-tech | corporate | editorial | heritage | kufi-bold | friendly | geometric | maghrebi
 * الكتالوج الكامل: docs/TYPOGRAPHY.md — معاينة حية: افتح العرض مع ?lab=fonts
 *
 * مثال:
 *   export const typography: TypographyConfig = { preset: 'academic', display: 'katibeh', latin: 'inter' };
 */
export const typography: TypographyConfig = {
  preset: 'default',
};
