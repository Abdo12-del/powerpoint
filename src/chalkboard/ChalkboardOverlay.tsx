import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Eraser, Highlighter, Pencil, Trash2, Undo2, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ChalkboardCanvas } from './ChalkboardCanvas';
import { CHALK_COLORS, MARKER_COLORS, STROKE_WIDTHS } from './types';
import type { ChalkTool } from './types';
import type { ChalkboardController } from './controller-types';
import { cn } from '@/lib/cn';

export interface ChalkboardOverlayProps {
  board: ChalkboardController;
  /** مفتاح الشاشة/الشريحة الحالية لتخزين التعليق (screenKey في العرض) */
  layerId: string;
  /** fixed: داخل العرض المباشر (يغطي الشاشة) — contained: داخل حاوية المختبر */
  variant?: 'fixed' | 'contained';
  /** اسم الطبقة للعرض في الشارة */
  layerLabel?: string;
}

const TOOLS: Array<{ id: ChalkTool; label: string; icon: LucideIcon; testid: string }> = [
  { id: 'chalk', label: 'طباشير', icon: Pencil, testid: 'cb-tool-chalk' },
  { id: 'marker', label: 'ماركر (تظليل)', icon: Highlighter, testid: 'cb-tool-marker' },
  { id: 'eraser', label: 'ممحاة', icon: Eraser, testid: 'cb-tool-eraser' },
];

const WIDTH_LABELS = ['رفيع', 'متوسط', 'عريض'];

function ToolButton({
  label,
  active,
  onClick,
  children,
  testid,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testid?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      data-testid={testid}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-1.5 transition',
        active
          ? 'bg-amber-400/25 text-amber-200 ring-1 ring-amber-300/50'
          : 'text-slate-300 hover:bg-white/10 hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

/**
 * شريط أدوات السبورة: القلم والممحاة + الألوان + السُمك + تراجع/مسح + تصدير
 */
export function ChalkboardToolbar({ board, variant }: { board: ChalkboardController; variant: 'fixed' | 'contained' }) {
  const colors = board.tool === 'marker' ? MARKER_COLORS : CHALK_COLORS;

  return (
    <div
      data-testid="chalkboard-toolbar"
      className={cn(
        'flex items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-950/85 p-1.5 shadow-2xl backdrop-blur-md',
        variant === 'fixed' ? 'fixed start-1/2 top-3 z-[70] -translate-x-1/2 rtl:translate-x-1/2' : 'absolute start-1/2 top-3 z-20 -translate-x-1/2 rtl:translate-x-1/2',
      )}
    >
      {TOOLS.map(({ id, label, icon: Icon, testid }) => (
        <ToolButton key={id} label={label} active={board.tool === id} onClick={() => board.setTool(id)} testid={testid}>
          <Icon className="h-5 w-5" />
        </ToolButton>
      ))}

      <span className="mx-0.5 h-6 w-px bg-white/10" />

      {/* الألوان — لوحة الأداة الفعّالة */}
      <div className="flex items-center gap-1" role="group" aria-label="ألوان الخط">
        {colors.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            aria-label={`لون ${c.label}`}
            data-testid="cb-color"
            data-color={c.value}
            onClick={() => board.setColor(c.value)}
            className={cn(
              'h-6 w-6 rounded-full border transition',
              board.color === c.value ? 'scale-110 border-white ring-2 ring-white/60' : 'border-white/20 hover:scale-105',
            )}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>

      <span className="mx-0.5 h-6 w-px bg-white/10" />

      {/* السُمك */}
      <div className="flex items-center gap-0.5" role="group" aria-label="سُمك الخط">
        {STROKE_WIDTHS.map((w, i) => (
          <button
            key={w}
            type="button"
            title={`سُمك ${WIDTH_LABELS[i]}`}
            aria-label={`سُمك ${WIDTH_LABELS[i]}`}
            data-testid={`cb-width-${i}`}
            onClick={() => board.setSize(w)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg transition',
              board.size === w ? 'bg-amber-400/25 ring-1 ring-amber-300/50' : 'hover:bg-white/10',
            )}
          >
            <span className="rounded-full" style={{ width: w + 3, height: w + 3, backgroundColor: board.tool === 'eraser' ? '#94a3b8' : '#f1f5f9' }} />
          </button>
        ))}
      </div>

      <span className="mx-0.5 h-6 w-px bg-white/10" />

      <ToolButton label="تراجع (Ctrl+Z مدعوم أيضاً من المتصفح)" onClick={board.undo} testid="cb-undo">
        <Undo2 className="h-5 w-5" />
      </ToolButton>
      <ToolButton label="مسح الطبقة (Delete)" onClick={board.clear} testid="cb-clear">
        <Trash2 className="h-5 w-5" />
      </ToolButton>
      <ToolButton label="تصدير PNG" onClick={board.exportPNG} testid="cb-download">
        <Download className="h-5 w-5" />
      </ToolButton>
    </div>
  );
}

/**
 * طبقة السبورة والتعليق — تُركَّب فوق الشرائح (العرض المباشر) أو في حاوية المختبر
 * لا تُصيّر شيئاً في الوضع المغلق — الحركة/الواجهة صفر حتى يطلبها المُقدِّم.
 */
export function ChalkboardOverlay({ board, layerId, variant = 'fixed', layerLabel }: ChalkboardOverlayProps) {
  // تسجيل الطبقة الحالية عند التغيير (للتراجع/المسح/التصدير)
  useEffect(() => {
    board.setLayer(layerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerId]);

  if (board.mode === 'off') return null;

  const notes = board.mode === 'notes';
  const boardLayer = board.mode === 'board';
  const strokes = notes ? board.notesFor(layerId) : board.boardStrokesFor(board.boardPage);
  const getStroke = () => ({ tool: board.tool, color: board.color, size: board.size });

  const wrapClass =
    variant === 'fixed'
      ? notes
        ? 'fixed inset-0 z-[60]'
        : 'fixed inset-0 z-[65]'
      : notes
        ? 'absolute inset-0 z-20'
        : 'absolute inset-0 z-30';

  return (
    <div data-testid="chalkboard-overlay" data-mode={board.mode} className={wrapClass}>
      {/* السبورة المستقلة: خلفية داكنة تحجب العرض */}
      {boardLayer && (
        <div
          aria-hidden
          className="absolute inset-0 bg-slate-950"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 20%, rgba(148,163,184,0.09), transparent 60%), repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0 2px, transparent 2px 4px)',
          }}
        />
      )}

      {/* قماش الرسم */}
      <ChalkboardCanvas
        strokes={strokes}
        getStroke={getStroke}
        onCommit={(stroke) => (notes ? board.commitNote(layerId, stroke) : board.commitBoardStroke(board.boardPage, stroke))}
        interactive
        cursorColor={board.color}
        cursorSize={board.size}
        className="absolute inset-0 h-full w-full touch-none"
      />

      {/* الشارة: النمط والطبقة وصفحة السبورة */}
      <div
        data-testid="cb-badge"
        className="pointer-events-none absolute end-3 top-3 z-[70] flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-bold text-slate-200 backdrop-blur"
      >
        <span>{notes ? `تعليق — ${layerLabel ?? 'الشاشة الحالية'}` : 'سبورة مستقلة'}</span>
        {boardLayer && (
          <span className="font-mono text-emerald-300" data-testid="cb-page">
            {board.boardPage + 1}/{board.boardPageCount}
          </span>
        )}
      </div>

      {/* تنقّل صفحات السبورة */}
      {boardLayer && (
        <div className="absolute bottom-4 start-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rtl:translate-x-1/2">
          <ToolButton label="الصفحة السابقة" onClick={board.prevPage} testid="cb-board-prev">
            <ChevronRight className="h-5 w-5" />
          </ToolButton>
          <button
            type="button"
            data-testid="cb-close"
            title="إنهاء السبورة (B / Esc)"
            aria-label="إنهاء السبورة"
            onClick={board.close}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-400/25 px-3 text-xs font-black text-amber-200 ring-1 ring-amber-300/50 transition hover:bg-amber-400/35"
          >
            <X className="h-4 w-4" />
            إنهاء السبورة
          </button>
          <ToolButton label="الصفحة التالية" onClick={board.nextPage} testid="cb-board-next">
            <ChevronLeft className="h-5 w-5" />
          </ToolButton>
        </div>
      )}

      {/* شريط الأدوات */}
      <ChalkboardToolbar board={board} variant={variant} />
    </div>
  );
}
