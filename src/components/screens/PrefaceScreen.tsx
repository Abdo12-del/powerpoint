import { motion } from 'framer-motion';
import type { PrefaceKind, PrefaceStep } from '@/types/presentation';
import { WordReveal, fadeUp, staggerContainer } from '@/components/ui';
import { cn } from '@/lib/cn';

const KIND_LABEL: Record<PrefaceKind, string> = {
  context: 'تمهيد عام',
  problem: 'الإشكالية',
  objectives: 'الأهداف',
  scope: 'النطاق والمنهجية',
};

interface PrefaceScreenProps {
  steps: PrefaceStep[];
  step: number;
  onGoto: (step: number) => void;
}

/** 2.2 المقدمة — 3 إلى 4 خطوات متتابعة، كل خطوة شريحة كاملة. */
export function PrefaceScreen({ steps, step, onGoto }: PrefaceScreenProps) {
  const current = steps[step];
  if (!current) return null;
  const Icon = current.icon;

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-6 pt-10 pb-24 sm:px-10">
      {/* مؤشر الخطوات */}
      <nav aria-label="خطوات المقدمة" className="flex flex-wrap items-center gap-2">
        <span className="me-2 text-sm font-bold text-amber-300">المقدمة</span>
        {steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onGoto(i)}
            aria-current={i === step ? 'step' : undefined}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition',
              i === step
                ? 'border-amber-400/50 bg-amber-400/15 text-amber-100'
                : i < step
                  ? 'border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/10'
                  : 'border-white/10 text-slate-400 hover:bg-white/[0.06]',
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold tabular-nums">
              {i + 1}
            </span>
            {KIND_LABEL[s.kind]}
          </button>
        ))}
      </nav>

      <motion.div
        key={current.id}
        variants={staggerContainer(0.08, 0.1)}
        initial="hidden"
        animate="show"
        className="mt-8 flex min-h-0 flex-1 flex-col"
      >
        <div className="flex items-center gap-4">
          <motion.span
            variants={fadeUp}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300"
          >
            <Icon className="h-7 w-7" />
          </motion.span>
          <div>
            <motion.div variants={fadeUp} className="text-sm font-bold text-amber-300/90">
              الخطوة {step + 1} من {steps.length} — {KIND_LABEL[current.kind]}
            </motion.div>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              <WordReveal text={current.title} delay={0.15} />
            </h2>
          </div>
        </div>

        <div className="mt-8 min-h-0 flex-1 overflow-y-auto">{current.content}</div>
      </motion.div>
    </div>
  );
}
