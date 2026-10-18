/**
 * إعدادات Recharts الجاهزة بسمة القالب: تُنثر على المكونات (<XAxis {...rechartsAxis} />) بدل تكرار الألوان.
 * المرجع: .agents/skills/data-charts-motion/references/recharts.md
 */
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { CHART_COLORS, CHART_SEMANTIC, chartSettings } from '../theme';

/** محور بلا خط/علامات، نص بخط القالب */
export const rechartsAxis = {
  axisLine: false,
  tickLine: false,
  tickMargin: 10,
  tick: { fill: CHART_SEMANTIC.text, fontSize: chartSettings.fontSize, fontFamily: chartSettings.fontFamily },
} as const;

/** شبكة أفقية منقّطة خفيفة */
export const rechartsGrid = { stroke: CHART_SEMANTIC.grid, strokeDasharray: '3 4', vertical: false } as const;

/**
 * انعكاس RTL: أول فئة على اليمين والمحور الرأسي على اليمين — <XAxis {...rechartsRtl.xAxis} /> <YAxis {...rechartsRtl.yAxis} />
 * والمفتاح: <Legend {...rechartsRtl.legend} /> — التلميح: <Tooltip {...rechartsRtl.tooltip} />
 */
export const rechartsRtl = {
  xAxis: { reversed: true },
  yAxis: { orientation: 'right' as const },
  legend: { align: 'right' as const, wrapperStyle: { direction: 'rtl' as const } },
  tooltip: { wrapperStyle: { direction: 'rtl' as const, outline: 'none' } },
  /** في التخطيط الأفقي (layout="vertical" عند Recharts) تُعكس القيم بدل الفئات */
  horizontal: { xAxis: { reversed: true, type: 'number' as const }, yAxis: { orientation: 'right' as const, type: 'category' as const } },
};

/** مؤشر التلميح (خلفية العمود المحوّم) */
export const rechartsCursor = { fill: 'rgba(255,255,255,0.05)' } as const;

/**
 * حركة دخول: بداية متأخرة لكل سلسلة (index) حتى تظهر بالتتابع، وتعطيل كامل عند تقليل الحركة.
 * <Bar {...rechartsAnimation(0)} /> <Bar {...rechartsAnimation(1)} />
 */
export function rechartsAnimation(index = 0, duration = Math.round(chartSettings.duration * 1000)) {
  const reduced = prefersReducedMotion();
  return {
    isAnimationActive: !reduced,
    animationBegin: reduced ? 0 : index * 300,
    animationDuration: duration,
    animationEasing: 'ease-out' as const,
  };
}

/** إعداد config لـ ChartContainer من قائمة سلاسل: rechartsConfig({ sales: 'المبيعات', cost: 'التكلفة' }) */
export function rechartsConfig(labels: Record<string, string>, colors: readonly string[] = CHART_COLORS) {
  return Object.fromEntries(Object.entries(labels).map(([key, label], i) => [key, { label, color: colors[i % colors.length] }]));
}

/** زوايا دائرية للأعمدة حسب الاتجاه */
export const rechartsBarRadius = {
  vertical: [6, 6, 0, 0] as [number, number, number, number],
  horizontalRtl: [6, 0, 0, 6] as [number, number, number, number],
};
