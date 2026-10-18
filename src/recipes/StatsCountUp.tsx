import { NumberTicker, AnimatedCircularProgressBar, BlurFade } from '@/components/gallery';
import { cn } from '@/lib/cn';

export interface StatItem {
  label: string;
  value: number;
  /** لاحقة مثل % أو + أو «دج» */
  suffix?: string;
  decimals?: number;
}

export interface StatsCountUpProps {
  stats: StatItem[];
  /** حلقة نسبة مئوية بارزة (اختياري) */
  ring?: { label: string; value: number };
  color?: string;
  className?: string;
}

/**
 * وصفة «إحصائيات تصعد» (نمط stats): عدّادات بنابض + حلقة نسبة.
 * انسخها إلى content الشريحة: <StatsCountUp stats={[{ label: 'مستخدم', value: 1250, suffix: '+' }, …]} ring={{ label: 'رضا', value: 92 }} />
 */
export function StatsCountUp({ stats, ring, color = '#fbbf24', className }: StatsCountUpProps) {
  return (
    <div className={cn('mx-auto flex w-full max-w-5xl flex-col items-center gap-10 sm:flex-row sm:justify-center', className)}>
      {ring && (
        <BlurFade delay={0.2} inView={false}>
          <div className="flex flex-col items-center gap-3">
            <AnimatedCircularProgressBar
              value={ring.value}
              gaugePrimaryColor={color}
              gaugeSecondaryColor="rgba(255,255,255,0.08)"
              className="size-40 text-3xl font-black"
            />
            <span className="text-sm text-slate-300">{ring.label}</span>
          </div>
        </BlurFade>
      )}
      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <BlurFade key={s.label} delay={0.3 + i * 0.12} inView={false}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              <div dir="ltr" className="font-mono text-4xl font-black tabular-nums" style={{ color }}>
                <NumberTicker value={s.value} delay={0.5 + i * 0.12} decimalPlaces={s.decimals ?? 0} />
                {s.suffix && <span className="text-2xl">{s.suffix}</span>}
              </div>
              <div className="mt-2 text-sm text-slate-300">{s.label}</div>
            </div>
          </BlurFade>
        ))}
      </div>
    </div>
  );
}
