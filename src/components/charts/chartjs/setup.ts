/**
 * إعداد Chart.js مرة واحدة بسمة القالب (الخط، الألوان، RTL، الأرقام). يستورد chart.js فعلياً → لا يُستورد إلا من القطعة الكسولة
 * (internal/ChartJsCanvas) أو من ملف رسم مستقل. المساعدات الخفيفة (RTL، التتابع، الألوان) في ./helpers.ts.
 * يُستدعى تلقائياً من مغلّف <ChartJs />؛ ويمكن استدعاؤه يدوياً عند استعمال react-chartjs-2 مباشرة.
 * المرجع: .agents/skills/data-charts-motion/references/chartjs.md
 */
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { CHART_SEMANTIC, chartSettings } from '../theme';

let ready = false;

/** تسجيل كل العناصر وضبط الافتراضيات — آمن للاستدعاء المتكرر */
export function setupChartJs(): typeof Chart {
  if (ready) return Chart;
  ready = true;
  Chart.register(...registerables);
  const d = Chart.defaults;
  d.font.family = chartSettings.fontFamily;
  d.font.size = chartSettings.fontSize;
  d.color = CHART_SEMANTIC.text;
  d.borderColor = CHART_SEMANTIC.grid;
  d.locale = chartSettings.locale;
  d.responsive = true;
  d.maintainAspectRatio = false;
  d.animation = prefersReducedMotion() ? false : { duration: Math.round(chartSettings.duration * 1000), easing: 'easeOutQuart' };
  d.plugins.legend.rtl = true;
  d.plugins.legend.textDirection = 'rtl';
  d.plugins.legend.labels.boxWidth = 12;
  d.plugins.legend.labels.boxHeight = 12;
  d.plugins.legend.labels.color = CHART_SEMANTIC.textStrong;
  d.plugins.legend.labels.usePointStyle = true;
  d.plugins.tooltip.rtl = true;
  d.plugins.tooltip.textDirection = 'rtl';
  d.plugins.tooltip.backgroundColor = CHART_SEMANTIC.tooltipBg;
  d.plugins.tooltip.borderColor = CHART_SEMANTIC.tooltipBorder;
  d.plugins.tooltip.borderWidth = 1;
  d.plugins.tooltip.titleColor = CHART_SEMANTIC.textStrong;
  d.plugins.tooltip.bodyColor = CHART_SEMANTIC.textStrong;
  d.plugins.tooltip.padding = 10;
  d.plugins.tooltip.cornerRadius = 10;
  d.plugins.title.color = CHART_SEMANTIC.textStrong;
  d.scale.grid.color = CHART_SEMANTIC.grid;
  d.scale.ticks.color = CHART_SEMANTIC.text;
  d.elements.bar.borderRadius = 6;
  d.elements.bar.borderSkipped = 'start';
  d.elements.line.borderWidth = 3;
  d.elements.line.tension = 0.35;
  d.elements.point.radius = 4;
  d.elements.point.hoverRadius = 6;
  d.elements.arc.borderColor = '#0f172a';
  d.elements.arc.borderWidth = 2;
  return Chart;
}

export { ChartDataLabels };
