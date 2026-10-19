import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { PresentationMeta } from '@/types/presentation';
import { WordReveal, fadeUp, staggerContainer } from '@/components/ui';
import { cn } from '@/lib/cn';
import { ParticlesBackground } from '@/components/effects/ParticlesBackground';
import { hasText, titleHasText } from '@/lib/blank';

/**
 * 2.1 شاشة العنوان — بطاقة تعريف العرض: هوية فقط، لا محتوى تعليمي.
 * القالب الأبيض: ما دامت الحقول فارغة لا يظهر إلا زر البدء (أيقونة) فوق الخلفية.
 */
export function TitleScreen({
  meta,
  onStart,
  reserveHeader = false,
  reserveFooter = false,
}: {
  meta: PresentationMeta;
  onStart: () => void;
  reserveHeader?: boolean;
  reserveFooter?: boolean;
}) {
  const background = meta.background && meta.background !== 'none' ? meta.background : undefined;
  const filled = titleHasText(meta);
  const organization = meta.organization.filter((line) => line.trim());
  const authors = meta.authors.filter((g) => hasText(g.role, ...g.names));
  // نص الزر: ما كُتب في startLabel؛ وإن لم يُحدَّد فالافتراضي يظهر فقط حين تكون الشاشة معبّأة
  const startLabel = meta.startLabel ?? (filled ? 'اضغط للبدء' : '');

  return (
    <div className="relative h-full w-full">
      {background && <ParticlesBackground preset={background} />}
      <motion.div
        variants={staggerContainer(0.1, 0.15)}
        initial="hidden"
        animate="show"
        className={cn(
          'relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center px-6 text-center',
          reserveHeader && 'pt-14 sm:pt-16',
          reserveFooter && 'pb-28',
        )}
      >
        {/* الجهة الرسمية */}
        {organization.length > 0 && (
          <motion.div variants={fadeUp} className="space-y-1 text-sm text-slate-300 sm:text-base">
            {organization.map((line, i) => (
              <div key={line} className={i === 0 ? 'font-bold text-slate-100' : ''}>
                {line}
              </div>
            ))}
          </motion.div>
        )}

        {filled && <motion.div variants={fadeUp} className="my-6 h-px w-40 bg-gradient-to-l from-transparent via-amber-400/70 to-transparent" />}

        {/* نوع العمل */}
        {hasText(meta.workType) && (
          <motion.div variants={fadeUp}>
            <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-sm font-bold text-amber-200">
              {meta.workType}
            </span>
          </motion.div>
        )}

        {/* العنوان الرئيسي — كشف بالكلمات لا بالحروف */}
        {hasText(meta.title) && (
          <h1 className="mt-6 text-balance text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            <WordReveal text={meta.title} delay={0.6} stagger={0.08} />
          </h1>
        )}

        {hasText(meta.subtitle) && (
          <motion.p variants={fadeUp} className="mt-4 max-w-3xl text-lg text-slate-300 sm:text-xl">
            {meta.subtitle}
          </motion.p>
        )}

        {/* المُنجزون */}
        {authors.length > 0 && (
          <motion.div variants={fadeUp} className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
            {authors.map((group) => (
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
        )}

        {/* التاريخ / الدفعة */}
        {hasText(meta.date) && (
          <motion.div variants={fadeUp} className="mt-6 text-slate-400">
            {meta.date}
          </motion.div>
        )}

        {/* زر البدء — بنصّ عند التعبئة، وأيقونة وحدها في القالب الأبيض */}
        <motion.button
          variants={fadeUp}
          type="button"
          onClick={onStart}
          autoFocus
          aria-label={startLabel || 'ابدأ العرض'}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className={
            startLabel
              ? 'group mt-10 inline-flex items-center gap-3 rounded-full bg-amber-400 px-8 py-3.5 text-lg font-extrabold text-slate-950 presentation-accent-shadow transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300'
              : 'group inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 text-slate-950 presentation-accent-shadow-strong transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300'
          }
        >
          {startLabel && <span>{startLabel}</span>}
          <span
            className={
              startLabel
                ? 'relative flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/15'
                : 'relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-950/15'
            }
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-950/20" />
            <Play className={startLabel ? 'relative h-4 w-4 -scale-x-100' : 'relative h-6 w-6 -scale-x-100'} />
          </span>
        </motion.button>
        {filled && (
          <motion.div variants={fadeUp} className="mt-3 text-xs text-slate-500">
            أو اضغط Enter / → للبدء
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
