import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CircleHelp, ListOrdered } from 'lucide-react';
import { Stagger, WordReveal, fadeUp } from '@/components/ui';

export interface ChapterPrefaceProps {
  /** رقم الفصل (للعرض) */
  number: number;
  /** جملة الانتقال من الفصل السابق إلى هذا الفصل */
  lead: string;
  /** السؤال (من الإشكالية) الذي يجيب عنه هذا الفصل */
  question: string;
  /** محاور الفصل بالترتيب (عناوين الشرائح) */
  outline: string[];
  /** ملاحظة اختيارية */
  note?: ReactNode;
}

/** شريحة الحصر الأولى — تمهيد الفصل: جملة انتقال + سؤال الفصل + محاوره. */
export function ChapterPreface({ number, lead, question, outline, note }: ChapterPrefaceProps) {
  return (
    <Stagger className="grid h-full content-center gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col justify-center gap-6">
        <motion.div variants={fadeUp} className="text-sm font-bold text-amber-300">
          الفصل {number}
        </motion.div>
        <p className="text-2xl leading-relaxed text-slate-100 sm:text-3xl">
          <WordReveal text={lead} delay={0.2} />
        </p>
        <motion.div variants={fadeUp} className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
          <CircleHelp className="mt-1 h-6 w-6 shrink-0 text-amber-300" />
          <div>
            <div className="text-xs font-bold text-amber-300/90">سؤال الفصل</div>
            <div className="text-xl font-bold leading-snug">{question}</div>
          </div>
        </motion.div>
        {note && (
          <motion.p variants={fadeUp} className="text-slate-300">
            {note}
          </motion.p>
        )}
      </div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-300">
          <ListOrdered className="h-4 w-4" /> محاور الفصل
        </div>
        <ol className="space-y-3">
          {outline.map((item, i) => (
            <motion.li key={item} variants={fadeUp} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold tabular-nums">
                {i + 1}
              </span>
              <span className="text-lg">{item}</span>
            </motion.li>
          ))}
        </ol>
      </motion.div>
    </Stagger>
  );
}
