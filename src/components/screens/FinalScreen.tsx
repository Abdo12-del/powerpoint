import { motion } from 'framer-motion';
import { Map as MapIcon, Quote, RotateCcw, Sparkles } from 'lucide-react';
import type { FinalData } from '@/types/presentation';
import { WordReveal, fadeUp, staggerContainer } from '@/components/ui';
import { ConfettiOnMount } from '@/components/effects/Confetti';
import { finalHasText, hasText } from '@/lib/blank';

interface FinalScreenProps {
  data: FinalData;
  onMap: () => void;
  onRestart: () => void;
}

/** 2.5 الخاتمة النهائية — خلاصة في 3–4 جمل + دعوة تأمل + شكر. لا معلومات جديدة. */
/**
 * 2.5 الخاتمة — تلخّص فقط.
 * القالب الأبيض: بلا نصّ لا يظهر إلا زرا التنقل.
 */
export function FinalScreen({ data, onMap, onRestart }: FinalScreenProps) {
  const celebrate = data.celebrate === true ? 'cannons' : data.celebrate || undefined;
  const filled = finalHasText(data);
  const summary = data.summary.filter((s) => s.trim());
  return (
    <motion.div
      variants={staggerContainer(0.12, 0.15)}
      initial="hidden"
      animate="show"
      className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center px-6 pt-10 pb-24 sm:px-10"
    >
      {celebrate && <ConfettiOnMount preset={celebrate} delay={700} />}
      {filled && (
        <motion.div variants={fadeUp} className="flex items-center gap-2 text-sm font-bold text-amber-300">
          <Sparkles className="h-4 w-4" /> الخاتمة
        </motion.div>
      )}
      {hasText(data.title) && (
        <h2 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">
          <WordReveal text={data.title} delay={0.2} />
        </h2>
      )}

      <ol className="mt-8 grid gap-3">
        {summary.map((s, i) => (
          <motion.li
            key={s}
            variants={fadeUp}
            className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-lg leading-relaxed"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-sm font-black text-amber-200 tabular-nums">
              {i + 1}
            </span>
            <span>{s}</span>
          </motion.li>
        ))}
      </ol>

      {hasText(data.closing) && (
        <motion.blockquote
          variants={fadeUp}
          className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-xl font-bold leading-relaxed"
        >
          <Quote className="mt-1 h-6 w-6 shrink-0 text-amber-300" />
          <span>{data.closing}</span>
        </motion.blockquote>
      )}

      {hasText(data.thanks) && (
        <motion.p variants={fadeUp} className="mt-8 text-center text-2xl font-extrabold text-slate-100 sm:text-3xl">
          {data.thanks}
        </motion.p>
      )}

      <motion.div variants={fadeUp} className={filled ? 'mt-8 flex flex-wrap justify-center gap-3' : 'flex flex-wrap justify-center gap-3'}>
        <button
          type="button"
          onClick={onMap}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 font-bold transition hover:bg-white/10"
        >
          <MapIcon className="h-4 w-4" /> العودة إلى الخريطة
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-amber-300"
        >
          <RotateCcw className="h-4 w-4" /> إعادة من البداية
        </button>
      </motion.div>
    </motion.div>
  );
}
