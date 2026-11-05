/**
 * طبقة المعدات فوق الشريحة المفتوحة.
 * - وضع التحرير (لوحة المعرض مفتوحة): تحديد، سحب، تحجيم بمقبض زاوية
 *   يحفظ نسبة الأبعاد، حذف، واستقبال الإفلات من اللوحة.
 * - وضع التقديم: صور فقط، بلا مقابض وبلا اعتراض للنقر.
 * كل الإحداثيات نسب إلى مستطيل الشريحة فتبقى صحيحة عند تغيير الحجم.
 */
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { assetById } from './catalog';
import { clampPlacement, NOMINAL_RECT, relativePoint, widthFromPointer, type SlideRect } from './geometry';
import { DND_MIME, DND_PREFIX } from './types';
import type { EquipmentAsset, PlacedEquipment } from './types';
import type { EquipmentController } from './useEquipment';
import { cn } from '@/lib/cn';

export interface EquipmentLayerProps {
  ctrl: EquipmentController;
  /** معرف الشريحة المالكة (slide.id الثابت) */
  slideId: string;
  /** وضع التحرير: مقابض وتفاعل. غير ذلك: عرض صامت */
  editing: boolean;
}

interface GestureState {
  mode: 'move' | 'resize';
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  rect: SlideRect;
}

/** عنصر مُدرج واحد: صورة + (في التحرير) مقبضا حذف وتحجيم */
function EquipmentNode({
  item,
  asset,
  editing,
  selected,
  ctrl,
  rectOf,
}: {
  item: PlacedEquipment;
  asset: EquipmentAsset;
  editing: boolean;
  selected: boolean;
  ctrl: EquipmentController;
  rectOf: () => SlideRect;
}) {
  const gesture = useRef<GestureState | null>(null);

  const startGesture = (e: React.PointerEvent<HTMLElement>, mode: 'move' | 'resize') => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    ctrl.select(item.id);
    ctrl.beginGesture();
    gesture.current = {
      mode,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: item.x,
      originY: item.y,
      rect: rectOf(),
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId || g.rect.width <= 0 || g.rect.height <= 0) return;
    if (g.mode === 'move') {
      const dx = (e.clientX - g.startX) / g.rect.width;
      const dy = (e.clientY - g.startY) / g.rect.height;
      ctrl.updateItem(item.id, clampPlacement(g.originX + dx, g.originY + dy, item.w, asset, g.rect));
    } else {
      ctrl.updateItem(item.id, { w: widthFromPointer({ x: item.x, y: item.y }, e.clientX, asset, g.rect) });
    }
  };

  const endGesture = (e: React.PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    gesture.current = null;
    ctrl.endGesture();
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      data-equipment-item={item.id}
      data-testid="equipment-item"
      role={editing ? 'button' : undefined}
      tabIndex={editing ? 0 : undefined}
      aria-label={editing ? `${asset.name} — اسحب للتحريك، الأسهم للضبط، Delete للحذف` : asset.name}
      className={cn(
        'absolute select-none',
        editing && 'cursor-move touch-none rounded-sm focus-visible:outline-2 focus-visible:outline-amber-300',
        editing && selected && 'outline-2 outline-amber-300/90 outline-dashed',
      )}
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        width: `${item.w * 100}%`,
        aspectRatio: `${asset.width} / ${asset.height}`,
      }}
      onPointerDown={editing ? (e) => startGesture(e, 'move') : undefined}
      onPointerMove={editing ? onPointerMove : undefined}
      onPointerUp={editing ? endGesture : undefined}
      onPointerCancel={editing ? endGesture : undefined}
      onFocus={editing ? () => ctrl.select(item.id) : undefined}
      onKeyDown={
        editing
          ? (e) => {
              // Enter/Space على العنصر لا يقلبان الشريحة
              if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
            }
          : undefined
      }
    >
      <img
        src={asset.src}
        alt={asset.name}
        draggable={false}
        className="pointer-events-none h-full w-full drop-shadow-lg"
      />

      {editing && selected && (
        <>
          <button
            type="button"
            data-testid="equipment-delete"
            aria-label={`حذف ${asset.name}`}
            title="حذف العنصر (Delete)"
            className="absolute -top-3 -end-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-slate-950/90 text-slate-200 shadow-lg transition hover:border-rose-400/50 hover:bg-rose-500/25 hover:text-rose-100 focus-visible:outline-2 focus-visible:outline-amber-300"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              ctrl.removeItem(item.id);
            }}
          >
            <X className="h-4 w-4" />
          </button>
          <div
            data-testid="equipment-resize"
            role="slider"
            tabIndex={-1}
            aria-label={`تغيير حجم ${asset.name} — اسحب قطرياً`}
            aria-valuenow={Math.round(item.w * 100)}
            aria-valuemin={5}
            aria-valuemax={90}
            title="تغيير الحجم (بنسبة أبعاد ثابتة)"
            className="absolute -bottom-2 -start-2 h-5 w-5 cursor-nwse-resize touch-none rounded-full border-2 border-amber-300 bg-slate-950/90 shadow-lg"
            onPointerDown={(e) => startGesture(e, 'resize')}
            onPointerMove={onPointerMove}
            onPointerUp={endGesture}
            onPointerCancel={endGesture}
          />
        </>
      )}
    </div>
  );
}

/** الطبقة الكاملة: حاوية الإفلات + كل عناصر الشريحة */
export function EquipmentLayer({ ctrl, slideId, editing }: EquipmentLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const items = ctrl.itemsOf(slideId);
  const rectOf = (): SlideRect => ref.current?.getBoundingClientRect() ?? NOMINAL_RECT;

  // تسجيل المستطيل الحي للقصّ الصحيح في التحريك بالأسهم
  const { registerRectProvider } = ctrl;
  useEffect(() => {
    if (!editing) return;
    registerRectProvider(() => ref.current?.getBoundingClientRect() ?? NOMINAL_RECT);
    return () => registerRectProvider(null);
  }, [editing, registerRectProvider]);

  const onDragOver = (e: React.DragEvent) => {
    const types = Array.from(e.dataTransfer.types);
    if (types.includes(DND_MIME) || types.includes('text/plain')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const onDrop = (e: React.DragEvent) => {
    let assetId = e.dataTransfer.getData(DND_MIME);
    if (!assetId) {
      const text = e.dataTransfer.getData('text/plain');
      if (text.startsWith(DND_PREFIX)) assetId = text.slice(DND_PREFIX.length);
    }
    if (!assetId || !assetById(assetId)) return;
    e.preventDefault();
    const rect = rectOf();
    ctrl.addAsset(assetId, relativePoint(e.clientX, e.clientY, rect), rect);
  };

  return (
    <div
      ref={ref}
      data-testid="equipment-layer"
      data-editing={editing || undefined}
      {...(editing ? { 'data-no-swipe': '' } : {})}
      className={cn('absolute inset-0', editing ? 'z-20' : 'pointer-events-none z-10 overflow-hidden')}
      onDragOver={editing ? onDragOver : undefined}
      onDrop={editing ? onDrop : undefined}
    >
      {items.map((item) => {
        const asset = assetById(item.assetId);
        if (!asset) return null;
        return (
          <EquipmentNode
            key={item.id}
            item={item}
            asset={asset}
            editing={editing}
            selected={editing && ctrl.selectedId === item.id}
            ctrl={ctrl}
            rectOf={rectOf}
          />
        );
      })}

      {editing && items.length === 0 && (
        <div className="pointer-events-none absolute inset-4 flex items-center justify-center rounded-2xl border-2 border-dashed border-amber-300/25">
          <span className="rounded-full bg-slate-950/70 px-4 py-1.5 text-sm text-amber-200/80">
            اسحب معدّة إلى هنا، أو انقر صورتها في اللوحة لإضافتها
          </span>
        </div>
      )}
    </div>
  );
}
