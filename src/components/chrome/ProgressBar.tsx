import { motion } from 'framer-motion';

/** شريط تقدّم أعلى الشاشة — عرضه = الموضع / الإجمالي (§6). */
export function ProgressBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div
      className="fixed inset-x-0 top-0 z-40 h-1 bg-white/10"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label="تقدّم العرض"
    >
      <motion.div
        className="h-full bg-gradient-to-l from-amber-300 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  );
}
