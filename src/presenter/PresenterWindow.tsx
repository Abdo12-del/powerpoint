import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Users, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { FlatSlide, Screen } from '@/lib/navigation';
import type { PresentationData } from '@/types/presentation';
import { PresenterTimer, formatElapsed, wallClock } from './timer';
import { EMPTY_NOTES_HINT, PREVIEW_CURRENT_W, PREVIEW_H, PREVIEW_NEXT_W, PREVIEW_W, TIMER_TICK_MS } from './types';
import type { ScreenInfo } from './notes';

export interface PresenterWindowProps {
  data: PresentationData;
  /** الشاشة الحالية والتالية (محسوبتان في العرض بنفس عقد التدفق §6) */
  screen: Screen;
  next: Screen;
  slides: FlatSlide[];
  /** معلومات الشريحتين للعرض النصي */
  currentInfo: ScreenInfo;
  nextInfo: ScreenInfo;
  /** ملاحظات الشاشة الحالية — لا تُعرض إلا هنا */
  notes: string;
  /** نسبة التقدّم 0..1 */
  progress: number;
  /** مُصيّر حقيقي لأي شاشة — تُغلَّف بمعاينة مصغّرة */
  renderScreen: (s: Screen) => ReactNode;
  onNext: () => void;
  onPrev: () => void;
  variant?: 'popup' | 'embedded';
  onClose?: () => void;
  /** نافذة الهدف لإصغاء المفاتيح داخل النافذة المنبثقة */
  popupWindow?: Window | null;
}

/** معاينة شريحة حقيقية مصغّرة — تُصيَّر بأبعاد 1280×720 ثم تُحوَّل بالمقياس */
function SlidePreview({
  label,
  info,
  children,
  width,
  tone,
}: {
  label: string;
  info: ScreenInfo;
  children: ReactNode;
  width: number;
  tone: 'current' | 'next';
}) {
  const scale = width / PREVIEW_W;
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1.5 flex items-center gap-2 text-[11px] font-bold">
        <span
          className={cn(
            'rounded-md px-2 py-0.5',
            tone === 'current' ? 'bg-amber-400/20 text-amber-200' : 'bg-white/10 text-slate-300',
          )}
        >
          {label}
        </span>
        <span className="truncate text-slate-400">{info.title}</span>
        <span className="ms-auto font-mono text-slate-500">{info.counter}</span>
      </figcaption>
      <div
        data-testid={tone === 'current' ? 'presenter-preview-current' : 'presenter-preview-next'}
        className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-inner"
        style={{ width, height: Math.round(width * (PREVIEW_H / PREVIEW_W)) }}
        aria-label={`${label}: ${info.title}`}
      >
        {/* الشاشة الحقيقية بأبعاد كاملة — مصغّرة بمنشأ أعلى-يمين (RTL) */}
        <div
          className="absolute inset-0"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top right' }}
        >
          <div style={{ width: PREVIEW_W, height: PREVIEW_H }} className="relative overflow-hidden bg-slate-950">
            {children}
          </div>
        </div>
      </div>
    </figure>
  );
}

/** مؤقت الوقت المنقضي — يبدأ تلقائياً ويُدار من نافذة المعلم نفسها */
function ElapsedTimer() {
  const timerRef = useRef<PresenterTimer | null>(null);
  if (timerRef.current === null) timerRef.current = new PresenterTimer();
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [clock, setClock] = useState(() => wallClock());
  const [, tickTock] = useReducer((x: number) => x + 1, 0);

  // بدء العدّ تلقائياً عند فتح النافذة (سلوك Reveal Notes)
  useEffect(() => {
    const now = performance.now() / 1000;
    timerRef.current?.start(now);
    setRunning(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const now = performance.now() / 1000;
      setElapsed(timerRef.current?.elapsed(now) ?? 0);
      setRunning(timerRef.current?.running ?? false);
      setClock(wallClock());
      tickTock();
    }, TIMER_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const toggle = () => {
    const now = performance.now() / 1000;
    const t = timerRef.current!;
    if (t.running) t.pause(now);
    else t.start(now);
    setElapsed(t.elapsed(now));
    setRunning(t.running);
  };

  const reset = () => {
    timerRef.current?.reset();
    setElapsed(0);
    setRunning(false);
  };

  return (
    <div
      data-testid="presenter-timer"
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
    >
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-400">الوقت المنقضي</span>
        <span data-testid="presenter-elapsed" className="font-mono text-3xl font-black tabular-nums text-emerald-300" dir="ltr">
          {formatElapsed(elapsed)}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs text-slate-400" data-testid="presenter-clock" dir="ltr">{clock}</span>
        <span className={cn('flex items-center gap-1 text-[10px] font-bold', running ? 'text-emerald-400' : 'text-slate-500')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', running ? 'animate-pulse bg-emerald-400' : 'bg-slate-600')} />
          {running ? 'يعمل' : 'متوقف'}
        </span>
      </div>
      <div className="ms-auto flex gap-1">
        <button
          type="button"
          data-testid="presenter-timer-toggle"
          onClick={toggle}
          aria-label={running ? 'إيقاف المؤقت مؤقتاً' : 'استئناف المؤقت'}
          className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          type="button"
          data-testid="presenter-timer-reset"
          onClick={reset}
          aria-label="تصفير المؤقت"
          className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * نافذة المعلم — نموذج Reveal Notes:
 * معاينة حقيقية للشريحة الحالية والتالية + الملاحظات الخاصة + مؤقت الوقت المنقضي
 * + تنقّل يقود العرض الرئيسي (المزامنة عبر مُصيّر النافذتين من السياق نفسه)
 */
export function PresenterWindow({
  data,
  screen,
  next,
  slides,
  currentInfo,
  nextInfo,
  notes,
  progress,
  renderScreen,
  onNext,
  onPrev,
  variant = 'popup',
  onClose,
  popupWindow,
}: PresenterWindowProps) {
  void data;
  void slides;

  // داخل النافذة المنبثقة: الأسهم والمسافة تنقّل العرض الرئيسي (مزامنة ثنائية الاتجاه)
  useEffect(() => {
    if (variant !== 'popup' || !popupWindow) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        onPrev(); // اتجاه RTL: اليمين = السابق (كما في العرض الرئيسي)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    popupWindow.addEventListener('keydown', onKeyDown);
    return () => popupWindow.removeEventListener('keydown', onKeyDown);
  }, [variant, popupWindow, onNext, onPrev, onClose]);

  return (
    <div
      data-testid="presenter-window"
      data-variant={variant}
      dir="rtl"
      className="flex h-full min-h-0 flex-col bg-slate-950 text-slate-100"
    >
      {/* الترويسة */}
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="rounded-lg bg-emerald-400/15 px-2.5 py-1 text-xs font-black text-emerald-300">نافذة المعلم</span>
        <span className="hidden items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-400 sm:flex">
          <Users className="h-3 w-3" />
          الملاحظات مخفية عن الطلاب
        </span>
        <span className="ms-auto font-mono text-[11px] text-slate-400" data-testid="presenter-counter">{currentInfo.counter}</span>
        {onClose && (
          <button
            type="button"
            data-testid="presenter-close"
            onClick={onClose}
            aria-label="إغلاق نافذة المعلم"
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* الجسم */}
      <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[1fr_340px]">
        {/* العمود الرئيسي: المعاينتان */}
        <div className="flex min-w-0 flex-col gap-3">
          <SlidePreview label="الشريحة الحالية" info={currentInfo} width={PREVIEW_CURRENT_W} tone="current">
            {renderScreen(screen)}
          </SlidePreview>

          <div className="flex flex-wrap items-start gap-4">
            <SlidePreview label="التالية" info={nextInfo} width={PREVIEW_NEXT_W} tone="next">
              {renderScreen(next)}
            </SlidePreview>

            {/* المؤقت + التنقّل */}
            <div className="flex min-w-[240px] flex-1 flex-col gap-3">
              <ElapsedTimer />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="presenter-prev"
                  onClick={onPrev}
                  className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] transition hover:bg-white/15"
                  aria-label="السابق (يمين)"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  data-testid="presenter-next"
                  onClick={onNext}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-400 font-black text-slate-950 transition hover:bg-amber-300"
                >
                  التالي
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
              {/* شريط التقدم */}
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-l from-amber-300 to-sky-400" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                الأسهم داخل هذه النافذة تنقّل العرض — النافذتان متزامنتان دائماً.
              </p>
            </div>
          </div>
        </div>

        {/* العمود الجانبي: الملاحظات */}
        <aside
          data-testid="presenter-notes"
          className="flex min-h-[220px] flex-col rounded-2xl border border-white/10 bg-white/[0.03]"
          aria-label="ملاحظات المعلم"
        >
          <p className="border-b border-white/10 px-4 py-2.5 text-[11px] font-black text-amber-300">ملاحظات المُقدِّم</p>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {notes.trim() ? (
              <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-100">{notes}</p>
            ) : (
              <p className="text-sm leading-relaxed text-slate-500">{EMPTY_NOTES_HINT}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
