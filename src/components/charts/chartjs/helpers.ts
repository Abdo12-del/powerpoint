/**
 * مساعدات Chart.js الخفيفة (بلا استيراد المكتبة — أنواع فقط): الألوان، مقاييس RTL، الحركة التتابعية، تسميات القيم.
 * تُمرَّر إلى <ChartJs options={{ scales: chartJsRtlScales, ...chartJsStagger(90) }} />
 * المرجع: .agents/skills/data-charts-motion/references/chartjs.md
 */
import type { ChartOptions } from 'chart.js';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { CHART_COLORS, CHART_SEMANTIC, chartSettings } from '../theme';

/** ألوان السلاسل بالترتيب: backgroundColor: chartJsColor(0) */
export function chartJsColor(index: number, alpha = 1): string {
  const hex = CHART_COLORS[index % CHART_COLORS.length];
  if (alpha >= 1) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** مقاييس RTL: أول فئة على اليمين والمحور الرأسي على اليمين (للأعمدة الرأسية) */
export const chartJsRtlScales: ChartOptions<'bar' | 'line'>['scales'] = {
  x: { reverse: true, grid: { display: false } },
  y: { position: 'right', beginAtZero: true, border: { display: false }, grid: { color: CHART_SEMANTIC.grid } },
};

/** مقاييس RTL للأشرطة الأفقية (indexAxis: 'y'): القيم تنمو من اليمين والتسميات على اليمين */
export const chartJsRtlHorizontalScales: ChartOptions<'bar'>['scales'] = {
  x: { reverse: true, beginAtZero: true, border: { display: false }, grid: { color: CHART_SEMANTIC.grid } },
  y: { position: 'right', grid: { display: false } },
};

/**
 * حركة تتابعية: كل عنصر يبدأ بعد سابقه (perItem مللي ثانية) — نمط «progressive» الرسمي مع منع التكرار عند التحديث.
 * options: { ...chartJsStagger(90) }
 */
export function chartJsStagger(perItem = 90, perDataset = 250): Pick<ChartOptions, 'animation'> {
  if (prefersReducedMotion()) return { animation: false };
  return {
    animation: {
      duration: Math.round(chartSettings.duration * 1000),
      easing: 'easeOutQuart',
      delay: (raw) => {
        const ctx = raw as unknown as { type?: string; mode?: string; dropped?: boolean; dataIndex: number; datasetIndex: number };
        if (ctx.type !== 'data' || ctx.mode !== 'default' || ctx.dropped) return 0;
        ctx.dropped = true;
        return ctx.dataIndex * perItem + ctx.datasetIndex * perDataset;
      },
    },
  };
}

/** تسميات القيم فوق الأعمدة (يتطلب تمرير plugins={[ChartDataLabels]}) */
export const chartJsDataLabels = {
  datalabels: {
    color: CHART_SEMANTIC.textStrong,
    anchor: 'end' as const,
    align: 'top' as const,
    offset: 2,
    font: { weight: 'bold' as const, size: 12 },
    formatter: (v: number) => new Intl.NumberFormat(chartSettings.locale).format(v),
  },
};
