import { useEffect, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { MotionBarChart, type MotionBarChartProps } from '@/components/charts/motion/MotionBarChart';
import { chartSettings } from '@/components/charts/theme';

export interface ChartStoryProps extends Omit<MotionBarChartProps, 'highlight'> {
  /** عنوان خبري يحمل الرسالة */
  title: ReactNode;
  subtitle?: ReactNode;
  /** جملة الخلاصة تظهر في الفصل الثالث */
  note: ReactNode;
  source?: ReactNode;
  /** الفئة التي تُبرَز بعد اكتمال النمو (الافتراضي: صاحبة أعلى قيمة) */
  focus?: number | string;
}

/**
 * وصفة «قصة الرسم» في ثلاثة فصول داخل شريحة stats/comparison:
 * 1) تنمو كل الأعمدة بالتتابع → 2) تبهت الفئات الأخرى ويبقى محور الرسالة مضيئاً → 3) تظهر جملة الخلاصة.
 * هكذا يقرأ الجمهور الصورة الكاملة أولاً ثم يُقاد إلى الاستنتاج بدل أن يُفرض عليه من البداية.
 *
 * @example
 * <ChartStory title="التسجيلات تضاعفت في ثلاث سنوات" note="2025 أعلى سنة على الإطلاق" categories={years} series={[{ label: 'الطلبة', values }]} />
 */
export function ChartStory({ title, subtitle, note, source, focus, categories, series, delay = 0.2, ...bar }: ChartStoryProps) {
  const reduced = prefersReducedMotion();
  const [phase, setPhase] = useState<0 | 1 | 2>(reduced ? 2 : 0);
  const duration = bar.duration ?? chartSettings.duration;
  const stagger = bar.stagger ?? chartSettings.stagger;
  const growth = delay + categories.length * series.length * stagger + duration;
  useEffect(() => {
    if (reduced) return;
    const t1 = setTimeout(() => setPhase(1), (growth + 0.4) * 1000);
    const t2 = setTimeout(() => setPhase(2), (growth + 1.1) * 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [growth, reduced]);
  const maxIndex = series.length ? series[0].values.indexOf(Math.max(...series[0].values)) : -1;
  const highlight = phase >= 1 ? (focus ?? maxIndex) : undefined;
  return (
    <ChartFrame title={title} subtitle={subtitle} note={phase >= 2 ? note : undefined} source={source} noteDelay={0}>
      <MotionBarChart categories={categories} series={series} delay={delay} highlight={highlight} {...bar} />
    </ChartFrame>
  );
}
