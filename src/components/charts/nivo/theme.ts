/**
 * سمة Nivo بألوان القالب + مساعدات RTL والحركة. تُمرَّر هكذا: <ResponsiveBar theme={nivoTheme} colors={nivoColors} {...nivoMotion()} />
 * المرجع: .agents/skills/data-charts-motion/references/nivo.md
 */
import type { PartialTheme } from '@nivo/theming';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { CHART_COLORS, CHART_SEMANTIC, chartSettings } from '../theme';

const text = {
  fontFamily: chartSettings.fontFamily,
  fontSize: chartSettings.fontSize,
  fill: CHART_SEMANTIC.text,
  outlineWidth: 0,
  outlineColor: 'transparent',
  outlineOpacity: 1,
};

export const nivoTheme: PartialTheme = {
  background: 'transparent',
  text,
  axis: {
    domain: { line: { stroke: CHART_SEMANTIC.axis, strokeWidth: 1 } },
    ticks: { line: { stroke: 'transparent' }, text },
    legend: { text: { ...text, fill: CHART_SEMANTIC.textStrong, fontWeight: 600 } },
  },
  grid: { line: { stroke: CHART_SEMANTIC.grid, strokeDasharray: '3 4' } },
  legends: { text: { ...text, fill: CHART_SEMANTIC.textStrong }, title: { text: { ...text, fill: CHART_SEMANTIC.textStrong } } },
  labels: { text: { ...text, fill: '#0f172a', fontWeight: 700 } },
  dots: { text: { ...text, fill: CHART_SEMANTIC.textStrong } },
  markers: { lineColor: CHART_SEMANTIC.highlight, lineStrokeWidth: 2, text: { ...text, fill: CHART_SEMANTIC.highlight } },
  crosshair: { line: { stroke: CHART_SEMANTIC.text, strokeWidth: 1, strokeOpacity: 0.6, strokeDasharray: '4 4' } },
  annotations: {
    text: { ...text, fill: CHART_SEMANTIC.textStrong, outlineWidth: 2, outlineColor: '#020617', outlineOpacity: 1 },
    link: { stroke: CHART_SEMANTIC.textStrong, strokeWidth: 1, outlineWidth: 2, outlineColor: '#020617', outlineOpacity: 1 },
    outline: { stroke: CHART_SEMANTIC.textStrong, strokeWidth: 2, outlineWidth: 2, outlineColor: '#020617', outlineOpacity: 1 },
    symbol: { fill: CHART_SEMANTIC.textStrong, outlineWidth: 2, outlineColor: '#020617', outlineOpacity: 1 },
  },
  tooltip: {
    container: {
      background: CHART_SEMANTIC.tooltipBg,
      color: CHART_SEMANTIC.textStrong,
      fontFamily: chartSettings.fontFamily,
      fontSize: chartSettings.fontSize,
      borderRadius: 10,
      border: `1px solid ${CHART_SEMANTIC.tooltipBorder}`,
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      direction: 'rtl',
      padding: '6px 10px',
    },
  },
};

/** لوحة الألوان الفئوية (مصفوفة قابلة للتمرير إلى colors=) */
export const nivoColors: string[] = [...CHART_COLORS];

/** حركة Nivo (react-spring): معطّلة عند تقليل الحركة. motionConfig: 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'default' */
export function nivoMotion(motionConfig: 'default' | 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses' = 'gentle') {
  return { animate: !prefersReducedMotion(), motionConfig } as const;
}

/**
 * RTL في Nivo: المكتبة ترتّب الفئات من اليسار، لذا نعكس ترتيب البيانات ونضع المحور الرأسي على اليمين:
 * <ResponsiveBar data={nivoRtlData(data)} axisLeft={null} axisRight={{ ...نفس إعدادات axisLeft }} margin={{ ...m, right: 56 }} />
 */
export function nivoRtlData<T>(data: readonly T[]): T[] {
  return [...data].reverse();
}

/** هامش قياسي مع مساحة للمحور الأيمن */
export const nivoMargin = { top: 24, right: 56, bottom: 40, left: 16 } as const;
