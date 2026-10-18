import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { PresentationMeta } from '@/types/presentation';
import { WordReveal, fadeUp, staggerContainer } from '@/components/ui';

/** 2.1 شاشة العنوان — بطاقة تعريف العرض: هوية فقط، لا محتوى تعليمي. */
export function TitleScreen({ meta, onStart }: { meta: PresentationMeta; onStart: () => void }) {
  return (
    <motion.div
      variants={staggerContainer(0.1, 0.15)}
      initial="hidden"
      animate="show"
      className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center px-6 text-center"
    >
      {/* الجهة الرسمية */}
      <motion.div variants={fadeUp} className="space-y-1 text-sm text-slate-300 sm:text-base">
        {meta.organization.map((line, i) => (
          <div key={line} className={i === 0 ? 'font-bold text-slate-100' : ''}>
            {line}
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="my-6 h-px w-40 bg-gradient-to-l from-transparent via-amber-400/70 to-transparent" />

      {/* نوع العمل */}
      <motion.div variants={fadeUp}>
        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-sm font-bold text-amber-200">
          {meta.workType}
        </span>
      </motion.div>

      {/* العنوان الرئيسي — كشف بالكلمات لا بالحروف */}
      <h1 className="mt-6 text-balance text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
        <WordReveal text={meta.title} delay={0.6} stagger={0.08} />
      </h1>

      {meta.subtitle && (
        <motion.p variants={fadeUp} className="mt-4 max-w-3xl text-lg text-slate-300 sm:text-xl">
          {meta.subtitle}
        </motion.p>
      )}

      {/* المُنجزون */}
      <motion.div variants={fadeUp} className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        {meta.authors.map((group) => (
          <div key={group.role} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <div className="text-xs font-bold text-amber-300/90">{group.role}</div>
            <div className="mt-1 space-y-0.5 text-lg font-semibold">
              {group.names.map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* التاريخ / الدفعة */}
      <motion.div variants={fadeUp} className="mt-6 text-slate-400">
        {meta.date}
      </motion.div>

      {/* زر البدء */}
      <motion.button
        variants={fadeUp}
        type="button"
        onClick={onStart}
        autoFocus
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="group mt-10 inline-flex items-center gap-3 rounded-full bg-amber-400 px-8 py-3.5 text-lg font-extrabold text-slate-950 shadow-[0_0_40px_rgba(251,191,36,0.35)] transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
      >
        <span>{meta.startLabel ?? 'اضغط للبدء'}</span>
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/15">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-950/20" />
          <Play className="relative h-4 w-4 -scale-x-100" />
        </span>
      </motion.button>
      <motion.div variants={fadeUp} className="mt-3 text-xs text-slate-500">
        أو اضغط Enter / → للبدء
      </motion.div>
    </motion.div>
  );
}
