import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Stagger, fadeUp } from '@/components/ui';

export interface ComparisonPair {
  from: ReactNode;
  to: ReactNode;
}

export interface ComparisonProps {
  /** عنوان الصف الأول (مشكلة / قبل) */
  fromTitle: string;
  /** عنوان الصف الثاني (حل / بعد) */
  toTitle: string;
  /** 3–5 أزواج متقابلة */
  pairs: ComparisonPair[];
}

/** النمط 5 — مقارنة زوجية: مشكلة↔حل، قبل↔بعد (صفان متقابلان + سهم). */
export function Comparison({ fromTitle, toTitle, pairs }: ComparisonProps) {
  return (
    <Stagger className="flex h-full flex-col justify-center gap-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-2">
        <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 py-2 text-center text-lg font-extrabold text-rose-200">
          {fromTitle}
        </div>
        <span className="w-10" />
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 py-2 text-center text-lg font-extrabold text-emerald-200">
          {toTitle}
        </div>
      </div>
      {pairs.slice(0, 5).map((p, i) => (
        <motion.div key={i} variants={fadeUp} className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3 px-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-[15px] leading-relaxed">{p.from}</div>
          <span className="flex w-10 items-center justify-center text-amber-300">
            <ArrowLeft className="h-6 w-6" aria-hidden />
          </span>
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-[15px] leading-relaxed">{p.to}</div>
        </motion.div>
      ))}
    </Stagger>
  );
}
