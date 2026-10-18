/**
 * سمة ECharts «presentation» بألوان القالب + مساعدات RTL والحركة. تُسجَّل تلقائياً في مغلّف <EChart />.
 * المرجع: .agents/skills/data-charts-motion/references/echarts.md
 */
import type { EChartsCoreOption } from 'echarts/core';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { CHART_COLORS, CHART_SEMANTIC, chartSettings } from '../theme';

export const ECHARTS_THEME_NAME = 'presentation';

const textStyle = { fontFamily: chartSettings.fontFamily, fontSize: chartSettings.fontSize, color: CHART_SEMANTIC.text };

/** كائن السمة (echarts.registerTheme(ECHARTS_THEME_NAME, echartsTheme)) */
export const echartsTheme = {
  color: [...CHART_COLORS],
  backgroundColor: 'transparent',
  textStyle,
  title: {
    textStyle: { color: CHART_SEMANTIC.textStrong, fontFamily: chartSettings.fontFamily, fontWeight: 700 },
    subtextStyle: { color: CHART_SEMANTIC.text },
  },
  legend: { textStyle: { ...textStyle, color: CHART_SEMANTIC.textStrong }, icon: 'roundRect', itemWidth: 12, itemHeight: 12 },
  tooltip: {
    backgroundColor: CHART_SEMANTIC.tooltipBg,
    borderColor: CHART_SEMANTIC.tooltipBorder,
    borderWidth: 1,
    textStyle: { ...textStyle, color: CHART_SEMANTIC.textStrong },
    extraCssText: 'direction: rtl; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.4);',
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: CHART_SEMANTIC.axis } },
    axisTick: { show: false },
    axisLabel: { ...textStyle, color: CHART_SEMANTIC.textStrong },
    splitLine: { show: false },
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: textStyle,
    splitLine: { lineStyle: { color: CHART_SEMANTIC.grid, type: 'dashed' } },
  },
  bar: { itemStyle: { borderRadius: [6, 6, 0, 0] }, barMaxWidth: 56 },
  line: { lineStyle: { width: 3 }, symbolSize: 8, symbol: 'circle', itemStyle: { borderWidth: 2, borderColor: '#0f172a' } },
  pie: { itemStyle: { borderColor: '#0f172a', borderWidth: 2, borderRadius: 4 }, label: { color: CHART_SEMANTIC.textStrong } },
  radar: {
    axisName: { color: CHART_SEMANTIC.textStrong },
    splitLine: { lineStyle: { color: CHART_SEMANTIC.grid } },
    splitArea: { show: false },
    axisLine: { lineStyle: { color: CHART_SEMANTIC.axis } },
  },
  gauge: {
    axisLine: { lineStyle: { width: 18 } },
    title: { color: CHART_SEMANTIC.text },
    detail: { color: CHART_SEMANTIC.textStrong, fontWeight: 800 },
  },
  sankey: { lineStyle: { color: 'gradient', opacity: 0.35 }, label: { color: CHART_SEMANTIC.textStrong } },
  funnel: { label: { color: '#0f172a', fontWeight: 700 }, itemStyle: { borderColor: '#0f172a', borderWidth: 2 } },
  treemap: { breadcrumb: { show: false }, itemStyle: { borderColor: '#0f172a', gapWidth: 2 }, label: { color: '#0f172a', fontWeight: 700 } },
};

/** إعدادات حركة الدخول (تتابع العناصر) — ...echartsAnimation(80) داخل option */
export function echartsAnimation(perItem = 80): EChartsCoreOption {
  if (prefersReducedMotion()) return { animation: false };
  return {
    animation: true,
    animationDuration: Math.round(chartSettings.duration * 1000),
    animationEasing: 'cubicOut',
    animationDelay: (idx: number) => idx * perItem,
    animationDurationUpdate: 700,
    animationEasingUpdate: 'cubicInOut',
  };
}

/**
 * انعكاس RTL للرسوم الديكارتية: أول فئة على اليمين، المحور الرأسي على اليمين، المفتاح يميناً.
 * option = echartsRtl({ xAxis: { type: 'category', data }, yAxis: {}, series })
 * يصلح للأشرطة الأفقية أيضاً (xAxis قيمي معكوس ← تنمو من اليمين، yAxis فئوي على اليمين ← التسميات يميناً).
 */
export function echartsRtl<T extends EChartsCoreOption>(option: T): T & EChartsCoreOption {
  const apply = (axis: unknown, patch: Record<string, unknown>) =>
    Array.isArray(axis) ? axis.map((a) => ({ ...patch, ...(a as object) })) : { ...patch, ...((axis as object) ?? {}) };
  const xPatch = { inverse: true };
  const yPatch = { position: 'right' };
  return {
    ...option,
    textStyle: { fontFamily: chartSettings.fontFamily, ...((option.textStyle as object) ?? {}) },
    legend:
      option.legend === undefined
        ? undefined
        : Array.isArray(option.legend)
          ? option.legend
          : { right: 0, align: 'right', ...(option.legend as object) },
    xAxis: option.xAxis === undefined ? undefined : apply(option.xAxis, xPatch),
    yAxis: option.yAxis === undefined ? undefined : apply(option.yAxis, yPatch),
    grid: { left: 16, right: 56, top: 32, bottom: 32, containLabel: true, ...((option.grid as object) ?? {}) },
  };
}

/** منسّق الأرقام لتسميات ECharts: formatter: echartsNumber() */
export function echartsNumber(style: 'decimal' | 'percent' | 'compact' = 'decimal') {
  const f = new Intl.NumberFormat(
    chartSettings.locale,
    style === 'percent'
      ? { style: 'percent', maximumFractionDigits: 1 }
      : style === 'compact'
        ? { notation: 'compact', maximumFractionDigits: 1 }
        : { maximumFractionDigits: 0 },
  );
  return (v: number | { value: number }) => f.format(typeof v === 'number' ? v : v.value);
}
