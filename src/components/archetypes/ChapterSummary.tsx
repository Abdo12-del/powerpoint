import { motion } from 'framer-motion';
import { ArrowLeft, CircleCheck } from 'lucide-react';
import { Stagger, fadeUp } from '@/components/ui';

export interface ChapterSummaryProps {
  /** 3–5 نقاط تجيب عن سؤال الفصل */
  points: string[];
  /** الخلاصة في جملة واحدة (الإجابة المباشرة عن سؤال الفصل) */
  answer?: string;
  /** جسر إلى الفصل التالي */
  nextHint?: string;
}

/** شريحة الحصر الأخيرة — خلاصة الفصل: 3–5 نقاط + إجابة مباشرة + جسر. */
export function ChapterSummary({ points, answer, nextHint }: ChapterSummaryProps) {
  return (
    <Stagger className="mx-auto flex h-full max-w-4xl flex-col justify-center gap-6">
      <ul className="grid gap-3">
        {points.slice(0, 5).map((p, i) => (
          <motion.li
            key={p}
            variants={fadeUp}
            className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <CircleCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-300" />
            <span className="text-lg leading-relaxed">
              <span className="me-2 text-sm font-bold text-slate-400 tabular-nums">{i + 1}</span>
              {p}
            </span>
          </motion.li>
        ))}
      </ul>
      {answer && (
        <motion.div variants={fadeUp} className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-xl font-bold leading-relaxed">
          {answer}
        </motion.div>
      )}
      {nextHint && (
        <motion.div variants={fadeUp} className="flex items-center gap-2 text-slate-300">
          <ArrowLeft className="h-4 w-4 text-amber-300" />
          <span>{nextHint}</span>
        </motion.div>
      )}
    </Stagger>
  );
}
