import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface Milestone {
  id: string;
  label: string;
  date?: string;
}

export interface TimelineDrawProps {
  milestones: Milestone[];
  color?: string;
  className?: string;
}

/**
 * وصفة «خط زمني يُرسم» (نمط timeline): الخط يُرسم من اليمين إلى اليسار ثم تنبثق المحطات بالتتابع.
 * <TimelineDraw milestones={[{ id: 'm1', label: 'دراسة الحالة', date: '2024' }, …]} />
 */
export function TimelineDraw({ milestones, color = '#fbbf24', className }: TimelineDrawProps) {
  const n = milestones.length;
  const W = 1000;
  const pad = 60;
  const xs = milestones.map((_, i) => (n === 1 ? W / 2 : W - pad - (i * (W - 2 * pad)) / (n - 1))); // يمين → يسار
  const drawDuration = 1.2;

  return (
    <div className={cn('mx-auto w-full max-w-5xl', className)}>
      <svg viewBox={`0 0 ${W} 80`} className="w-full overflow-visible" style={{ direction: 'ltr' }}>
        <motion.line
          x1={W - pad}
          y1={40}
          x2={pad}
          y2={40}
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: drawDuration, ease: 'easeInOut', delay: 0.2 }}
        />
        {xs.map((x, i) => (
          <motion.circle
            key={milestones[i].id}
            cx={x}
            cy={40}
            r={11}
            fill="#0f172a"
            stroke={color}
            strokeWidth={4}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.2 + (drawDuration * i) / Math.max(n - 1, 1),
              type: 'spring',
              stiffness: 320,
              damping: 20,
            }}
            style={{ transformOrigin: `${x}px 40px` }}
          />
        ))}
      </svg>
      <div className="relative mt-2 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {milestones.map((m, i) => (
          <motion.div
            key={m.id}
            className="px-1 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5 + (drawDuration * i) / Math.max(n - 1, 1),
            }}
          >
            {m.date && (
              <div dir="ltr" className="font-mono text-xs text-slate-400">
                {m.date}
              </div>
            )}
            <div className="text-sm font-bold">{m.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
