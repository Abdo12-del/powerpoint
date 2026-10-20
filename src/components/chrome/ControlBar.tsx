import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, CircleHelp, Home, Lightbulb, Map as MapIcon, Maximize, Minimize, PenLine, Search, Wifi } from 'lucide-react';
import type { PresentationController } from '@/hooks/usePresentation';
import { cn } from '@/lib/cn';

interface ControlBarProps {
  ctrl: PresentationController;
  isFullscreen: boolean;
  onFullscreen: () => void;
  onHelp: () => void;
  /** فتح السبورة المستقلة — يُمرَّر من Presentation عند تثبيت حزمة السبورة */
  onChalkboard?: () => void;
  /** تكبير/خروج مركزي (حزمة التكبير والتركيز) */
  onZoom?: () => void;
  /** تسليط الضوء */
  onSpotlight?: () => void;
  /** مؤشر الليزر */
  onLaser?: () => void;
}

function CtrlButton({
  label,
  onClick,
  children,
  disabled,
  className,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.currentTarget.blur();
        onClick();
      }}
      className={cn(
        'inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-2.5 text-slate-100 transition',
        'hover:border-amber-400/40 hover:bg-amber-400/15 hover:text-amber-100 focus-visible:outline-2 focus-visible:outline-amber-300',
        'disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white/[0.06]',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** شريط التحكم أسفل الشاشة: أزرار + عدّاد «الشريحة 5 / 22» (§6). */
export function ControlBar({ ctrl, isFullscreen, onFullscreen, onHelp, onChalkboard, onZoom, onSpotlight, onLaser }: ControlBarProps) {
  const { screen, slides, current } = ctrl;
  const isTitle = screen.kind === 'title';
  const isFinal = screen.kind === 'final';

  let counter: string;
  switch (screen.kind) {
    case 'title':
      counter = 'شاشة العنوان';
      break;
    case 'preface':
      counter = `المقدمة ${screen.step + 1} / ${ctrl.sequence.filter((s) => s.kind === 'preface').length}`;
      break;
    case 'map':
      counter = 'خريطة الفصول';
      break;
    case 'slide':
      counter = `الشريحة ${screen.index + 1} / ${slides.length}`;
      break;
    case 'final':
      counter = 'الخاتمة';
      break;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:p-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 p-2 shadow-2xl shadow-black/40 backdrop-blur-md">
        {/* السابق — على اليمين في اتجاه RTL */}
        <CtrlButton label="السابق (←)" onClick={ctrl.prev} disabled={isTitle}>
          <ChevronRight className="h-5 w-5" />
        </CtrlButton>

        <div className="hidden min-w-[9rem] flex-col items-center px-2 text-center sm:flex">
          <span className="text-sm font-bold tabular-nums">{counter}</span>
          {current && current.chapter.title.trim() && (
            <span className="max-w-[14rem] truncate text-[11px] text-slate-400">{current.chapter.title}</span>
          )}
        </div>
        <span className="px-1 text-xs font-bold tabular-nums sm:hidden">{counter}</span>

        {/* التالي — على اليسار في اتجاه RTL */}
        <CtrlButton label="التالي (→ / Enter / Space)" onClick={ctrl.next} disabled={isFinal}>
          <ChevronLeft className="h-5 w-5" />
        </CtrlButton>

        <span className="mx-1 h-6 w-px bg-white/10" />

        <CtrlButton
          label="خريطة الفصول (↓ / M / Esc)"
          onClick={ctrl.openMap}
          className={cn(screen.kind === 'map' && 'border-amber-400/40 bg-amber-400/15 text-amber-100')}
        >
          <MapIcon className="h-5 w-5" />
          <span className="hidden text-sm font-semibold md:inline">الخريطة</span>
        </CtrlButton>
        <CtrlButton label="العودة لشاشة العنوان" onClick={ctrl.restart} disabled={isTitle}>
          <Home className="h-5 w-5" />
        </CtrlButton>
        <CtrlButton label={isFullscreen ? 'إنهاء ملء الشاشة (F)' : 'ملء الشاشة (F)'} onClick={onFullscreen}>
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </CtrlButton>
        {onChalkboard && (
          <CtrlButton label="سبورة مستقلة (B)" onClick={onChalkboard}>
            <PenLine className="h-5 w-5" />
          </CtrlButton>
        )}
        {onZoom && (
          <CtrlButton label="تكبير مركزي (Z) — أو Alt+Click على أي جزء" onClick={onZoom}>
            <Search className="h-5 w-5" />
          </CtrlButton>
        )}
        {onSpotlight && (
          <CtrlButton label="تسليط الضوء (S)" onClick={onSpotlight}>
            <Lightbulb className="h-5 w-5" />
          </CtrlButton>
        )}
        {onLaser && (
          <CtrlButton label="مؤشر ليزر (L)" onClick={onLaser}>
            <Wifi className="h-5 w-5 rotate-90" />
          </CtrlButton>
        )}
        <CtrlButton label="اختصارات لوحة المفاتيح (?)" onClick={onHelp}>
          <CircleHelp className="h-5 w-5" />
        </CtrlButton>
      </div>
    </div>
  );
}
