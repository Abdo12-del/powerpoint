/**
 * السمة المشتركة لكل الرسوم البيانية في القالب (الألوان، الأرقام، الخط، التوقيت) — تستعملها الرسوم الحركية المخصّصة
 * ومغلّفات Recharts وNivo وChart.js وECharts، وكذلك الخرائط الجغرافية، حتى تبدو كل المرئيات من عائلة بصرية واحدة.
 * الدليل: docs/CHARTS.md وdocs/MAPS.md — المهارة: .agents/skills/data-charts-motion
 */

/** لوحة الألوان الفئوية (بترتيب الاستعمال): أصفر التمييز أولاً ثم السماوي… حتى 10 سلاسل */
export const CHART_COLORS = ['#fbbf24', '#38bdf8', '#34d399', '#fb7185', '#a78bfa', '#fb923c', '#2dd4bf', '#f472b6', '#a3e635', '#818cf8'] as const;

/** ألوان دلالية: نتيجة إيجابية/سلبية، محايد، الفئة المميَّزة */
export const CHART_SEMANTIC = {
  positive: '#34d399',
  negative: '#fb7185',
  neutral: '#64748b',
  muted: 'rgba(148, 163, 184, 0.35)',
  highlight: '#fbbf24',
  grid: 'rgba(255, 255, 255, 0.08)',
  axis: 'rgba(255, 255, 255, 0.18)',
  text: '#94a3b8',
  textStrong: '#e2e8f0',
  tooltipBg: 'rgba(15, 23, 42, 0.96)',
  tooltipBorder: 'rgba(255, 255, 255, 0.12)',
} as const;

/** تدرّج متسلسل (للخرائط الحرارية والكثافة) من الداكن إلى أصفر التمييز */
export const CHART_SEQUENTIAL = ['#1e293b', '#334155', '#78350f', '#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fde68a'] as const;

/** تدرّج متباعد (سلبي ← محايد ← إيجابي) */
export const CHART_DIVERGING = ['#fb7185', '#fda4af', '#334155', '#6ee7b7', '#34d399'] as const;

export interface ChartSettings {
  /** محلية الأرقام: 'ar-DZ' (0123 غربية — افتراضي القالب) أو 'ar-EG' (٠١٢٣ هندية) */
  locale: string;
  /** عائلة خط النص في الرسوم (تتبع اقتران الطباعة) */
  fontFamily: string;
  /** حجم خط المحاور بالبكسل */
  fontSize: number;
  /** مدة الحركة الأساسية بالثواني */
  duration: number;
  /** الفاصل بين العناصر المتتابعة بالثواني */
  stagger: number;
}

export const chartSettings: ChartSettings = {
  locale: 'ar-DZ',
  fontFamily: 'var(--font-body, system-ui, sans-serif)',
  fontSize: 13,
  duration: 0.9,
  stagger: 0.08,
};

/** تغيير الإعدادات المشتركة مرة واحدة (مثلاً في src/data/presentation.tsx): configureCharts({ locale: 'ar-EG' }) */
export function configureCharts(patch: Partial<ChartSettings>): ChartSettings {
  return Object.assign(chartSettings, patch);
}

/** لون السلسلة رقم i (يدور على اللوحة) أو اللون المحدّد */
export function seriesColor(index: number, explicit?: string): string {
  return explicit ?? CHART_COLORS[index % CHART_COLORS.length];
}

export type NumberStyle = 'decimal' | 'percent' | 'compact' | 'currency';

export interface FormatNumberOptions {
  style?: NumberStyle;
  /** عدد المنازل العشرية (الافتراضي: 0 للعدد، 1 للنسبة والمختصر) */
  digits?: number;
  currency?: string;
  locale?: string;
}

/** تنسيق رقم بمحلية القالب: formatNumber(1284) → "1,284" · formatNumber(0.874, { style: 'percent' }) → "87.4%" */
export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  const { style = 'decimal', currency = 'DZD', locale = chartSettings.locale } = options;
  const digits = options.digits ?? (style === 'decimal' ? 0 : 1);
  const base: Intl.NumberFormatOptions = {
    maximumFractionDigits: digits,
    minimumFractionDigits: style === 'percent' || style === 'compact' ? 0 : digits,
  };
  if (style === 'percent') return new Intl.NumberFormat(locale, { ...base, style: 'percent' }).format(value);
  if (style === 'compact') return new Intl.NumberFormat(locale, { ...base, notation: 'compact' }).format(value);
  if (style === 'currency') return new Intl.NumberFormat(locale, { ...base, style: 'currency', currency }).format(value);
  return new Intl.NumberFormat(locale, base).format(value);
}

/** منسّق جاهز يُمرَّر إلى المكتبات: valueFormatter('percent') */
export function valueFormatter(style: NumberStyle = 'decimal', digits?: number): (v: number) => string {
  return (v: number) => formatNumber(v, { style, digits });
}

/** خطوات محاور «جميلة» (nice ticks) بين 0 والحد الأقصى */
export function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0];
  const rough = max / count;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}
