import type { FontId, FontRole } from './registry';

/** اقتران جاهز: خط لكل دور */
export interface TypographyPreset {
  id: PresetId;
  label: string;
  /** متى يناسب */
  mood: string;
  fonts: Record<FontRole, FontId>;
}

export const PRESET_IDS = [
  'default',
  'academic',
  'modern-tech',
  'corporate',
  'editorial',
  'heritage',
  'kufi-bold',
  'friendly',
  'geometric',
  'maghrebi',
] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export const TYPOGRAPHY_PRESETS: Record<PresetId, TypographyPreset> = {
  default: {
    id: 'default',
    label: 'الافتراضي — Cairo',
    mood: 'محايد وواضح لكل أنواع العروض؛ لا يغيّر شيئاً في مظهر القالب',
    fonts: { heading: 'cairo', body: 'cairo', display: 'cairo', mono: 'jetbrains-mono' },
  },
  academic: {
    id: 'academic',
    label: 'أكاديمي — Changa + Cairo + Amiri',
    mood: 'مناقشات التخرج والرسائل والمحاضرات: عناوين قوية، نص هادئ، اقتباسات بنسخ كلاسيكي',
    fonts: { heading: 'changa', body: 'cairo', display: 'amiri', mono: 'jetbrains-mono' },
  },
  'modern-tech': {
    id: 'modern-tech',
    label: 'تقني حديث — Readex Pro + IBM Plex Sans Arabic',
    mood: 'منتجات وبرمجيات وشركات ناشئة: قابلية قراءة عالية وكود بروابط حروف',
    fonts: { heading: 'readex-pro', body: 'ibm-plex-sans-arabic', display: 'reem-kufi', mono: 'fira-code' },
  },
  corporate: {
    id: 'corporate',
    label: 'مؤسسي — Almarai + Tajawal',
    mood: 'تقارير الشركات والجهات الرسمية: رصين ونظيف',
    fonts: { heading: 'almarai', body: 'tajawal', display: 'el-messiri', mono: 'jetbrains-mono' },
  },
  editorial: {
    id: 'editorial',
    label: 'تحريري — Markazi Text + Noto Naskh',
    mood: 'صحافة وأدب وعلوم إنسانية: عناوين نسخية عصرية ونص نسخ مريح',
    fonts: { heading: 'markazi-text', body: 'noto-naskh-arabic', display: 'aref-ruqaa', mono: 'jetbrains-mono' },
  },
  heritage: {
    id: 'heritage',
    label: 'تراثي — Amiri + Scheherazade + Katibeh',
    mood: 'تاريخ ودين ولغة وتراث: نسخ أصيل وعناوين بروح المخطوطات',
    fonts: { heading: 'amiri', body: 'scheherazade-new', display: 'katibeh', mono: 'jetbrains-mono' },
  },
  'kufi-bold': {
    id: 'kufi-bold',
    label: 'كوفي جريء — Noto Kufi + Noto Sans Arabic',
    mood: 'هوية بصرية قوية وشاشات كبيرة: عناوين كوفية ونص سانس بمحور عرض',
    fonts: { heading: 'noto-kufi-arabic', body: 'noto-sans-arabic', display: 'kufam', mono: 'jetbrains-mono' },
  },
  friendly: {
    id: 'friendly',
    label: 'ودود — Baloo Bhaijaan 2 + Vazirmatn',
    mood: 'تعليم الأطفال والفعاليات والمنتجات اللطيفة: مدوّر ومرح',
    fonts: { heading: 'baloo-bhaijaan-2', body: 'vazirmatn', display: 'lemonada', mono: 'fira-code' },
  },
  geometric: {
    id: 'geometric',
    label: 'هندسي — Alexandria + Rubik',
    mood: 'تصميم وتسويق وعلامات تجارية: أشكال هندسية وثنائية اللغة متناسقة',
    fonts: { heading: 'alexandria', body: 'rubik', display: 'marhey', mono: 'jetbrains-mono' },
  },
  maghrebi: {
    id: 'maghrebi',
    label: 'مغاربي — El Messiri + Harmattan',
    mood: 'ثقافة وتراث المغرب العربي: نص بأسلوب ورش وعناوين بلمسة خطّية',
    fonts: { heading: 'el-messiri', body: 'harmattan', display: 'aref-ruqaa', mono: 'jetbrains-mono' },
  },
};

export const PRESET_LIST: TypographyPreset[] = Object.values(TYPOGRAPHY_PRESETS);

/** إعدادات الطباعة التي يحررها المستخدم/الوكيل في src/data/typography.ts */
export interface TypographyConfig {
  /** اقتران جاهز (الافتراضي: default) */
  preset?: PresetId;
  /** تجاوز دور بعينه: { heading: 'changa' } */
  heading?: FontId;
  body?: FontId;
  display?: FontId;
  mono?: FontId;
  /** خط لاتيني مرافق يُضاف إلى مكدس العناوين والنص (مثلاً 'inter') */
  latin?: FontId;
  /** مضاعف حجم النص الأساسي للتعويض بين الخطوط (1 = بلا تغيير) */
  scale?: number;
}

export function resolveRoles(config: TypographyConfig = {}): Record<FontRole, FontId> {
  const preset = TYPOGRAPHY_PRESETS[config.preset ?? 'default'] ?? TYPOGRAPHY_PRESETS.default;
  return {
    heading: config.heading ?? preset.fonts.heading,
    body: config.body ?? preset.fonts.body,
    display: config.display ?? preset.fonts.display,
    mono: config.mono ?? preset.fonts.mono,
  };
}
