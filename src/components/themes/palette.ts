import { clampChroma, formatHex, oklch, parse, wcagContrast } from 'culori';
import type { CSSProperties } from 'react';
import type { ThemeMode } from '@/types/presentation';

export const DEFAULT_CHAPTER_COLOR = '#0ea5e9';
const HUE_FALLBACK = 220;
const CHROMA_FALLBACK = 0.16;

export interface ChapterPalette {
  base: string;
  accent: string;
  accentStrong: string;
  soft: string;
  gradientStart: string;
  gradientEnd: string;
  analogous: [string, string];
  complementary: string;
  triad: [string, string];
  onAccent: string;
}

const MODE_TUNING: Record<ThemeMode, { accentL: number; strongL: number; softL: number; startL: number; endL: number }> = {
  dark: { accentL: 0.78, strongL: 0.86, softL: 0.36, startL: 0.4, endL: 0.28 },
  light: { accentL: 0.46, strongL: 0.38, softL: 0.94, startL: 0.94, endL: 0.88 },
  corporate: { accentL: 0.44, strongL: 0.36, softL: 0.94, startL: 0.93, endL: 0.86 },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const hueAt = (hue: number, offset: number) => ((hue + offset) % 360 + 360) % 360;

function makeHex(hue: number, lightness: number, chroma: number): string {
  const inGamut = clampChroma(
    {
      mode: 'oklch',
      l: clamp(lightness, 0.08, 0.97),
      c: clamp(chroma, 0.025, 0.3),
      h: hue,
    },
    'oklch',
  );
  return formatHex(inGamut) ?? DEFAULT_CHAPTER_COLOR;
}

/**
 * يشتق لوحة فصل متناغمة في فضاء OKLCH: لونان متجاوران، مكمّل وثلاثي، مع درجات
 * تباين مختلفة للوضع الداكن والفاتح والمؤسسي. يقبل أي صيغة CSS يفهمها Culori.
 */
export function deriveChapterPalette(color: string, mode: ThemeMode = 'dark'): ChapterPalette {
  const parsed = parse(color) ?? parse(DEFAULT_CHAPTER_COLOR)!;
  const converted = oklch(parsed);
  const hue = converted?.h ?? HUE_FALLBACK;
  const chroma = clamp(converted?.c ?? CHROMA_FALLBACK, 0.1, 0.22);
  const tuning = MODE_TUNING[mode];
  const at = (offset: number, lightness: number, chromaScale = 1) => makeHex(hueAt(hue, offset), lightness, chroma * chromaScale);
  const accent = at(0, tuning.accentL);
  const accentColor = parse(accent)!;
  const darkInk = mode === 'dark' ? '#020617' : '#0f172a';
  const whiteContrast = wcagContrast(accentColor, parse('#ffffff')!);
  const darkContrast = wcagContrast(accentColor, parse(darkInk)!);

  return {
    base: formatHex(parsed) ?? DEFAULT_CHAPTER_COLOR,
    accent,
    accentStrong: at(0, tuning.strongL),
    soft: at(0, tuning.softL, 0.48),
    gradientStart: at(-18, tuning.startL, 0.78),
    gradientEnd: at(22, tuning.endL, 0.68),
    analogous: [at(-28, tuning.accentL, 0.9), at(28, tuning.accentL, 0.9)],
    complementary: at(180, tuning.accentL, 0.88),
    triad: [at(120, tuning.accentL, 0.88), at(240, tuning.accentL, 0.88)],
    onAccent: whiteContrast >= darkContrast ? '#ffffff' : darkInk,
  };
}

/** قيم CSS لكل وضع؛ يختارها نطاق الفصل تلقائياً عبر data-presentation-theme. */
export function chapterPaletteStyle(color: string): CSSProperties {
  const style: Record<string, string> = {};
  const modes: ThemeMode[] = ['dark', 'light', 'corporate'];
  const fields: (keyof ChapterPalette)[] = ['accent', 'accentStrong', 'soft', 'gradientStart', 'gradientEnd', 'complementary', 'onAccent'];

  style['--chapter-brand-color'] = deriveChapterPalette(color, 'dark').base;

  for (const mode of modes) {
    const palette = deriveChapterPalette(color, mode);
    for (const field of fields) style[`--chapter-${mode}-${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`] = palette[field] as string;
    style[`--chapter-${mode}-analogous-a`] = palette.analogous[0];
    style[`--chapter-${mode}-analogous-b`] = palette.analogous[1];
    style[`--chapter-${mode}-triad-a`] = palette.triad[0];
    style[`--chapter-${mode}-triad-b`] = palette.triad[1];
  }

  return style as CSSProperties;
}
