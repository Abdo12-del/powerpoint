import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpLeft, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { NumberRoll, type NumberRollProps } from '@/components/typography/NumberRoll';
import { Sparkline } from '@/components/charts/motion/Sparkline';
import { CHART_SEMANTIC, chartSettings, formatNumber } from '@/components/charts/theme';

export interface KpiItem {
  label: string;
  value: number;
  /** سلسلة قصيرة للخط المصغّر (6–12 قيمة) */
  trend?: number[];
  /** نسبة التغيّر (0.12 = +12%) — تُلوَّن إيجاباً/سلباً */
  delta?: number;
  /** خيارات Intl للرقم الكبير: { style: 'percent' } · { notation: 'compact' } */
  format?: NumberRollProps['format'];
  prefix?: string;
  suffix?: string;
}

export interface KpiCardsProps {
  items: KpiItem[];
  /** محلية الأرقام (الافتراضي: محلية الرسوم ar-DZ) */
  locale?: string;
  /** الأعمدة في الشاشات العريضة */
  columns?: 2 | 3 | 4;
  /** تأخير بدء التدحرج بالثواني */
  delay?: number;
  className?: string;
}

/**
 * وصفة «بطاقات مؤشرات» (نمط stats): رقم يتدحرج (NumberRoll) + خط اتجاه مصغّر (Sparkline) + شارة تغيّر ملوّنة.
 * البطاقات تدخل بالتتابع، ثم تتدحرج الأرقام من 0 إلى قيمتها، ثم تُرسم الخطوط. ≤ 4 مؤشرات في الشريحة.
 *
 * @example
 * <KpiCards items={[{ label: 'الطلبة', value: 1284, trend: [900, 980, 1050, 1120, 1284], delta: 0.14 }, …]} />
 */
export function KpiCards({
  items,
  locale = chartSettings.locale,
  columns = items.length >= 4 ? 4 : items.length >= 3 ? 3 : 2,
  delay = 0.3,
  className,
}: KpiCardsProps) {
  const reduced = prefersReducedMotion();
  const [live, setLive] = useState(reduced);
  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setLive(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay, reduced]);
  return (
    <div
      dir="rtl"
      className={cn('grid w-full gap-4', columns === 4 ? 'md:grid-cols-4' : columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2', className)}
    >
      {items.map((it, i) => {
        const tone = it.delta === undefined ? 'neutral' : it.delta > 0 ? 'positive' : it.delta < 0 ? 'negative' : 'neutral';
        const Icon = tone === 'positive' ? ArrowUpLeft : tone === 'negative' ? ArrowDownLeft : Minus;
        return (
          <motion.article
            key={it.label}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            <div className="text-sm font-semibold text-slate-400">{it.label}</div>
            <div className="flex items-end justify-between gap-3">
              <NumberRoll
                value={live ? it.value : 0}
                locales={locale}
                format={it.format}
                prefix={it.prefix}
                suffix={it.suffix}
                className="text-4xl font-black text-slate-50"
              />
              {it.trend && live && <Sparkline values={it.trend} width={110} height={36} delay={0.2 + i * 0.12} />}
            </div>
            {it.delta !== undefined && (
              <div
                dir="ltr"
                className={cn(
                  'inline-flex w-fit items-center gap-1 self-start rounded-full px-2 py-0.5 text-xs font-bold',
                  tone === 'positive' && 'bg-emerald-400/15',
                  tone === 'negative' && 'bg-rose-400/15',
                  tone === 'neutral' && 'bg-white/10',
                )}
                style={{ color: tone === 'positive' ? CHART_SEMANTIC.positive : tone === 'negative' ? CHART_SEMANTIC.negative : CHART_SEMANTIC.text }}
              >
                <Icon size={14} />
                {formatNumber(Math.abs(it.delta), { style: 'percent', locale })}
              </div>
            )}
          </motion.article>
        );
      })}
    </div>
  );
}
