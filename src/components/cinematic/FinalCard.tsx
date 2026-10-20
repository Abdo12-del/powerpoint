import { motion, type Variants } from 'framer-motion';
import type { FinalCardConfig } from '@/cinematic/types';
import { cn } from '@/lib/cn';

export interface FinalCardProps {
  config: FinalCardConfig;
  /** هل البطاقة ظاهرة؟ (المرحلة النهائية أو نهاية الانتقال) */
  visible: boolean;
  /** تقدّم الانتقال 0..1 — يتحكم في شدة الدخول */
  progress: number;
  /** لون التمييز */
  accent?: string;
  /** زر إعادة المشاهدة داخل البطاقة */
  onReplay?: () => void;
  className?: string;
}

const brandVariants: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { delay: 0.18, duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * البطاقة الختامية — اسم العلامة التجارية وعبارة متحركة.
 * تعمل كطبقة DOM فوق مشهد WebGL، بنصّ عربي حادّ (لا يُصيَّر داخل canvas).
 */
export function FinalCard({ config, visible, progress, accent = '#f5b544', onReplay, className }: FinalCardProps) {
  const words = config.tagline.trim().split(/\s+/).filter(Boolean);
  const styleClass =
    config.transition === 'zoom'
      ? 'scale-100'
      : config.transition === 'fade'
        ? ''
        : config.transition === 'reveal'
          ? ''
          : '';

  return (
    <motion.section
      aria-label={`البطاقة الختامية — ${config.brand}`}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: Math.max(0.2, config.transitionDuration * 0.55), ease: 'easeOut' }}
      style={{
        pointerEvents: visible ? 'auto' : 'none',
        background: config.background ?? undefined,
      }}
      className={cn(
        'absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden px-6 text-center',
        !config.background && 'bg-[radial-gradient(ellipse_at_50%_70%,rgba(245,181,68,0.10),transparent_62%)]',
        styleClass,
        className,
      )}
    >
      {/* هالات ضوئية */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.85 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute left-1/2 top-[38%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${accent}22, transparent 65%)` }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#04070f] to-transparent" />
      </div>

      <div className="relative z-10 flex max-w-3xl flex-col items-center">
        {/* شعار العلامة */}
        <motion.div
          variants={brandVariants}
          initial="hidden"
          animate={visible ? 'show' : 'hidden'}
          className="relative mb-8"
        >
          {config.logoSrc ? (
            <img
              src={config.logoSrc}
              alt={config.brand}
              className="h-20 w-20 rounded-2xl object-contain shadow-[0_18px_60px_-18px_rgba(0,0,0,0.9)]"
            />
          ) : (
            <>
              <div
                className="flex h-20 w-20 rotate-45 items-center justify-center rounded-[1.35rem] shadow-[0_24px_80px_-24px_rgba(245,181,68,0.85)]"
                style={{ background: `linear-gradient(135deg, ${accent}, #fff8e7)` }}
              >
                <div className="-rotate-45">
                  <BrandMonogram brand={config.brand} />
                </div>
              </div>
              <motion.div
                aria-hidden
                animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.16, 1] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 -z-10 rounded-full blur-2xl"
                style={{ background: accent }}
              />
            </>
          )}
        </motion.div>

        {/* اسم العلامة */}
        <motion.h2
          variants={brandVariants}
          initial="hidden"
          animate={visible ? 'show' : 'hidden'}
          className="font-display text-5xl font-black leading-none text-white sm:text-7xl"
        >
          <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
            {config.brand}
          </span>
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={visible ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 h-px w-44 origin-center"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />

        {/* العبارة المتحركة — تُكشف كلمةً كلمة (لا تُقسَّم العربية إلى حروف) */}
        <p className="mt-7 text-balance text-xl font-semibold leading-relaxed text-slate-200 sm:text-2xl">
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              initial={{
                opacity: 0,
                y: config.typewriter ? 0 : '0.6em',
                filter: config.typewriter ? 'blur(0px)' : 'blur(10px)',
              }}
              animate={
                visible
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : { opacity: 0, y: config.typewriter ? 0 : '0.6em', filter: config.typewriter ? 'blur(0px)' : 'blur(10px)' }
              }
              transition={{
                // typewriter: إيقاع كتابة أسرع بلا ضبابية — والكشف يبقى بالكلمات لا بالحروف
                delay: config.typewriter ? 0.42 + i * 0.16 : 0.55 + i * 0.11,
                duration: config.typewriter ? 0.22 : 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="inline-block whitespace-pre"
            >
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          ))}
        </p>

        {/* مؤشر ختامي رفيع */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ delay: 0.55 + words.length * 0.11 + 0.35, duration: 0.8 }}
          className="mt-12 flex items-center gap-3 text-xs font-bold text-slate-400"
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
          <span>شكراً لمشاهدتكم</span>
          <span className="h-px w-8 bg-white/15" />
          <span className="font-mono text-[11px] tracking-wide text-slate-500" dir="ltr">
            {new Date().getFullYear()}
          </span>
        </motion.div>

        {onReplay && (
          <motion.button
            type="button"
            onClick={onReplay}
            initial={{ opacity: 0, y: 10 }}
            animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.55 + words.length * 0.11 + 0.7, duration: 0.6 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 py-2 text-xs font-extrabold text-slate-200 backdrop-blur transition hover:bg-white/10"
          >
            <span className="inline-block h-3.5 w-3.5 rounded-full border border-current" />
            أعد المشاهدة
          </motion.button>
        )}
      </div>

      {/* شريط تقدّم الانتقال — يظهر أثناء العبور فقط */}
      {progress > 0 && progress < 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 h-px bg-white/5">
          <div className="h-full" style={{ width: `${progress * 100}%`, background: accent }} />
        </div>
      )}
    </motion.section>
  );
}

/** حرف/حرفان من اسم العلامة داخل المعيّن — بديل الشعار */
function BrandMonogram({ brand }: { brand: string }) {
  const trimmed = brand.trim();
  if (!trimmed) {
    return <span className="block h-4 w-4 rounded-full bg-slate-950/80" />;
  }
  const letters = trimmed.split(/\s+/).length > 1
    ? trimmed.split(/\s+/).map((w) => w[0]).join('').slice(0, 2)
    : trimmed.slice(0, 1);
  return <span className="text-2xl font-black text-slate-950">{letters}</span>;
}
