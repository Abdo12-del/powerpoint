/**
 * لوحة «المعدات العلمية» — معرض جانبي صغير مرتبط بالعارض، لا يغادر الشريحة.
 * بحث + تصفح بالفئات، صور مصغرة بأسماء واضحة، سحب إلى الشريحة أو نقر للإضافة
 * (بديل اللمس ولوحة المفاتيح)، وتراجع/إعادة/مسح لشريحة العمل.
 */
import { useMemo, useState } from 'react';
import { FlaskConical, Redo2, Search, Trash2, Undo2, X } from 'lucide-react';
import { EQUIPMENT, matchesQuery } from './catalog';
import { DND_MIME, DND_PREFIX, EQUIPMENT_CATEGORIES } from './types';
import type { EquipmentCategory } from './types';
import type { EquipmentController } from './useEquipment';
import { cn } from '@/lib/cn';

export interface EquipmentPanelProps {
  ctrl: EquipmentController;
}

/** زر أداة صغير بنمط شريط التحكم */
function PanelTool({
  label,
  onClick,
  disabled,
  children,
  testid,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  testid?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      data-testid={testid}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] px-2 text-slate-100 transition',
        'hover:border-amber-400/40 hover:bg-amber-400/15 hover:text-amber-100 focus-visible:outline-2 focus-visible:outline-amber-300',
        'disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white/[0.06]',
      )}
    >
      {children}
    </button>
  );
}

export function EquipmentPanel({ ctrl }: EquipmentPanelProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<EquipmentCategory | 'all'>('all');

  const filtered = useMemo(
    () => EQUIPMENT.filter((asset) => (category === 'all' || asset.category === category) && matchesQuery(asset, query)),
    [query, category],
  );

  const slideCount = ctrl.activeSlideId ? ctrl.itemsOf(ctrl.activeSlideId).length : 0;

  return (
    <aside
      data-testid="equipment-panel"
      data-no-swipe
      aria-label="المعدات العلمية"
      className="fixed top-12 bottom-24 start-3 z-40 flex w-72 max-w-[86vw] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-black/40 backdrop-blur-md"
    >
      {/* الرأس */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-amber-100">
          <FlaskConical className="h-4.5 w-4.5 text-amber-300" />
          المعدات العلمية
        </h2>
        <button
          type="button"
          aria-label="إغلاق لوحة المعدات (Esc)"
          title="إغلاق (Esc)"
          data-testid="equipment-close"
          onClick={ctrl.close}
          className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* البحث */}
      <div className="px-3 pt-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 start-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                ctrl.close();
              }
            }}
            placeholder="ابحث: قارورة، bécher، ميزان…"
            aria-label="ابحث في المعدات العلمية"
            data-testid="equipment-search"
            className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-2 pe-3 ps-8 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400/40 focus:outline-none"
          />
        </label>
      </div>

      {/* الفئات */}
      <div role="group" aria-label="فئات المعدات" className="flex flex-wrap gap-1.5 px-3 pt-2.5">
        <button
          type="button"
          aria-pressed={category === 'all'}
          onClick={() => setCategory('all')}
          className={cn(
            'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-amber-300',
            category === 'all'
              ? 'border-amber-400/50 bg-amber-400/15 text-amber-100'
              : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25',
          )}
        >
          الكل
        </button>
        {EQUIPMENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={category === cat.id}
            data-testid={`equipment-cat-${cat.id}`}
            onClick={() => setCategory(cat.id)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-amber-300',
              category === cat.id
                ? 'border-amber-400/50 bg-amber-400/15 text-amber-100'
                : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* الشبكة: سحب أو نقر */}
      <div className="mt-2.5 grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto px-3 pb-3">
        {filtered.map((asset) => (
          <button
            key={asset.id}
            type="button"
            draggable
            data-testid={`equipment-tile-${asset.id}`}
            aria-label={`إضافة ${asset.name} إلى الشريحة — انقر أو اسحب`}
            title={`${asset.name} — انقر للإضافة أو اسحب إلى الشريحة`}
            onDragStart={(e) => {
              e.dataTransfer.setData(DND_MIME, asset.id);
              e.dataTransfer.setData('text/plain', `${DND_PREFIX}${asset.id}`);
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onClick={() => ctrl.addAsset(asset.id)}
            className="group flex cursor-grab flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] p-2 transition hover:border-amber-400/40 hover:bg-amber-400/10 focus-visible:outline-2 focus-visible:outline-amber-300 active:cursor-grabbing"
          >
            <img
              src={asset.src}
              alt=""
              draggable={false}
              className="h-16 w-16 object-contain drop-shadow transition group-hover:scale-105"
            />
            <span className="text-center text-[11px] font-semibold leading-4 text-slate-200">{asset.name}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 py-6 text-center text-sm text-slate-400">لا نتائج مطابقة لبحثك</p>
        )}
      </div>

      {/* الأدوات والتلميح */}
      <div className="border-t border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <PanelTool label="تراجع (Ctrl+Z)" onClick={ctrl.undo} disabled={!ctrl.canUndo} testid="equipment-undo">
            <Undo2 className="h-4 w-4" />
          </PanelTool>
          <PanelTool label="إعادة (Ctrl+Y)" onClick={ctrl.redo} disabled={!ctrl.canRedo} testid="equipment-redo">
            <Redo2 className="h-4 w-4" />
          </PanelTool>
          <PanelTool
            label="مسح معدات هذه الشريحة"
            onClick={ctrl.clearActiveSlide}
            disabled={slideCount === 0}
            testid="equipment-clear"
          >
            <Trash2 className="h-4 w-4" />
          </PanelTool>
          <span className="ms-auto text-[11px] tabular-nums text-slate-400">عناصر الشريحة: {slideCount}</span>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-slate-400">
          اسحب صورة إلى الشريحة أو انقرها للإضافة. ابحث بالعربية أو الفرنسية أو بمعرف الأصل، وصفِّ النتائج
          بالفئة. حدّد العنصر ثم حرّكه بالأسهم، وغيّر حجمه من المقبض، واحذفه بـ Delete. وللتجربة التفاعلية
          استعمل زر «تجربة» على المعدة المحددة أو وضع التجربة (T).
        </p>
      </div>
    </aside>
  );
}
