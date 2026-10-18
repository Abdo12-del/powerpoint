import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { CHART_SEMANTIC, chartSettings, formatNumber, seriesColor, type NumberStyle } from '../theme';
import { ChartLegend, SvgText, useChartMotion, type ChartMotionProps } from './shared';

export interface DonutSlice {
  label: string;
  value: number;
  color?: string;
}

export interface MotionDonutChartProps extends ChartMotionProps {
  data: DonutSlice[];
  /** قطر الرسم بالبكسل */
  size?: number;
  /** سماكة الحلقة (0 = دائرة كاملة/فطيرة) */
  thickness?: number;
  /** نص المركز (الافتراضي: المجموع) */
  centerValue?: string;
  centerLabel?: string;
  valueStyle?: NumberStyle;
  showLegend?: boolean;
  /** إظهار النسبة بدل القيمة في المفتاح */
  legendPercent?: boolean;
  /** اتجاه الدوران: الافتراضي عكس عقارب الساعة في RTL (أول شريحة تبدأ من الأعلى نحو اليسار) */
  clockwise?: boolean;
  /** فجوة بين الشرائح بالراديان */
  padAngle?: number;
  highlight?: number | string;
  className?: string;
  ariaLabel?: string;
}

/**
 * حلقة/فطيرة تُرسم شريحةً بعد شريحة (مسح قوسي بـ pathLength) مع مجموع في المركز ومفتاح يظهر بالتتابع.
 * الحركة متناسبة: كل شريحة تأخذ من المدة الكلية بقدر حصتها، فيكتمل الرسم في وقت واحد مهما تعدّدت الشرائح.
 *
 * @example
 * <MotionDonutChart data={[{ label: 'إناث', value: 58 }, { label: 'ذكور', value: 42 }]} valueStyle="percent" centerLabel="النسبة" />
 */
export function MotionDonutChart({
  data,
  size = 260,
  thickness = 30,
  centerValue,
  centerLabel,
  valueStyle = 'decimal',
  showLegend = true,
  legendPercent = true,
  clockwise,
  padAngle = 0.025,
  highlight,
  className,
  ariaLabel,
  ...motionProps
}: MotionDonutChartProps) {
  const { reduced, delay, duration, rtl } = useChartMotion(motionProps);
  const cw = clockwise ?? !rtl;
  const total = data.reduce((n, d) => n + Math.max(0, d.value), 0) || 1;
  const highlightIndex = typeof highlight === 'string' ? data.findIndex((d) => d.label === highlight) : highlight;
  const isMuted = (i: number) => highlightIndex !== undefined && highlightIndex >= 0 && i !== highlightIndex;
  const r = size / 2;
  const stroke = Math.max(2, thickness || r);
  const radius = thickness ? r - stroke / 2 : r / 2;
  const sweepTotal = duration * 1.5;
  const fmt = (v: number) => formatNumber(v, { style: valueStyle });

  let angle = -Math.PI / 2; // نبدأ من الأعلى
  let elapsed = 0;
  const slices = data.map((d, i) => {
    const share = Math.max(0, d.value) / total;
    const span = share * Math.PI * 2;
    const a0 = angle;
    const a1 = cw ? angle + span : angle - span;
    angle = a1;
    const pad = Math.min(padAngle, span / 4) * (cw ? 1 : -1);
    const s0 = a0 + pad / 2;
    const s1 = a1 - pad / 2;
    const x0 = r + radius * Math.cos(s0);
    const y0 = r + radius * Math.sin(s0);
    const x1 = r + radius * Math.cos(s1);
    const y1 = r + radius * Math.sin(s1);
    const large = Math.abs(s1 - s0) > Math.PI ? 1 : 0;
    const sweep = cw ? 1 : 0;
    const path =
      share >= 0.9999
        ? `M ${r + radius} ${r} A ${radius} ${radius} 0 1 ${sweep} ${r - radius} ${r} A ${radius} ${radius} 0 1 ${sweep} ${r + radius} ${r}`
        : `M ${x0} ${y0} A ${radius} ${radius} 0 ${large} ${sweep} ${x1} ${y1}`;
    const start = delay + elapsed;
    elapsed += share * sweepTotal;
    return { ...d, i, share, path, start, dur: Math.max(0.15, share * sweepTotal), color: seriesColor(i, d.color) };
  });

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-8', className)} dir="rtl">
      <svg
        role="img"
        aria-label={ariaLabel ?? `رسم دائري: ${data.map((d) => d.label).join('، ')}`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0 overflow-visible"
        style={{ direction: 'ltr' }}
      >
        {thickness > 0 && <circle cx={r} cy={r} r={radius} fill="none" stroke={CHART_SEMANTIC.grid} strokeWidth={stroke} />}
        {slices.map((s) => (
          <motion.path
            key={s.i}
            d={s.path}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            opacity={isMuted(s.i) ? 0.3 : 1}
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: s.dur, delay: s.start, ease: 'linear' }}
          />
        ))}
        {thickness > 0 && (
          <motion.g
            initial={reduced ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay + sweepTotal * 0.6 }}
            style={{ transformOrigin: 'center', transformBox: 'view-box' }}
          >
            <SvgText x={r} y={centerLabel ? r - 8 : r} fill={CHART_SEMANTIC.textStrong} weight={800} size={Math.max(18, size / 7)}>
              {centerValue ?? fmt(total)}
            </SvgText>
            {centerLabel && (
              <SvgText x={r} y={r + Math.max(14, size / 12)} size={chartSettings.fontSize}>
                {centerLabel}
              </SvgText>
            )}
          </motion.g>
        )}
      </svg>
      {showLegend && (
        <ChartLegend
          className="flex-col items-start gap-y-2.5"
          items={slices.map((s) => ({
            label: s.label,
            color: s.color,
            value: legendPercent ? formatNumber(s.share, { style: 'percent' }) : fmt(s.value),
          }))}
          delay={delay + 0.2}
          muted={isMuted}
        />
      )}
    </div>
  );
}
