/**
 * خطاف المعدات العلمية — يربط المخزن النقي بحالة React على نمط useChalkboard:
 * فتح/إغلاق اللوحة، التحديد، الإدراج، الإيماءات، التراجع/الإعادة،
 * والحفظ المحلي المؤجّل. مفاتيح التحرير تُلتقط في طور الالتقاط (capture)
 * حتى تسبق تنقّل العرض العام عندما تكون اللوحة مفتوحة.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { assetById } from './catalog';
import { clampPlacement, NOMINAL_RECT, placeEquipment, type SlideRect } from './geometry';
import { EquipmentStore, newEquipmentId } from './store';
import { NUDGE, NUDGE_LARGE } from './types';
import type { PlacedEquipment } from './types';

/** تأخير الحفظ المؤجّل بعد آخر تعديل (ms) — نمط السبورة نفسه */
const SAVE_DEBOUNCE_MS = 400;

const INTERACTIVE = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/** واجهة تحكم المعدات — تُستعمل في اللوحة والطبقة وشريط التحكم */
export interface EquipmentController {
  /** هل لوحة المعرض مفتوحة؟ (فتحها = وضع تحرير الشريحة الحالية) */
  panelOpen: boolean;
  /** العنصر المحدد حالياً (إن وجد) */
  selectedId: string | null;
  /** الشريحة النشطة — تُضبط من العرض عند كل تنقّل */
  activeSlideId: string | null;
  /** يرتفع مع كل تعديل لإعادة الرسم */
  revision: number;
  canUndo: boolean;
  canRedo: boolean;

  itemsOf: (slideId: string) => PlacedEquipment[];
  setActiveSlide: (slideId: string | null) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  select: (itemId: string | null) => void;

  /** إدراج أصل: بالنقر (مركز الشريحة) أو بالإفلات (نقطة نسبية + مستطيل حي) */
  addAsset: (assetId: string, center?: { x: number; y: number }, rect?: SlideRect) => void;
  updateItem: (itemId: string, patch: Partial<Pick<PlacedEquipment, 'x' | 'y' | 'w'>>) => void;
  removeItem: (itemId: string) => void;
  removeSelected: () => void;
  clearActiveSlide: () => void;

  /** إيماءة سحب/تحجيم: خطوة تراجع واحدة لكل إيماءة */
  beginGesture: () => void;
  endGesture: () => void;
  /** تحريك المحدد بالأسهم (كسور نسبية) */
  nudgeSelected: (dx: number, dy: number) => void;
  /** مصدر مستطيل الشريحة الحي — تسجّله طبقة التحرير للقصّ الصحيح */
  registerRectProvider: (provider: (() => SlideRect) | null) => void;

  undo: () => void;
  redo: () => void;
}

export function useEquipment(): EquipmentController {
  const storeRef = useRef<EquipmentStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = EquipmentStore.fromStorage();
  }
  const store = storeRef.current;

  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const panelOpenRef = useRef(panelOpen);
  panelOpenRef.current = panelOpen;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const activeSlideRef = useRef(activeSlideId);
  activeSlideRef.current = activeSlideId;
  const rectProviderRef = useRef<(() => SlideRect) | null>(null);

  const bump = useCallback(() => setRevision((r) => r + 1), []);

  // ── الحفظ المؤجّل: عند كل تعديل نُبرمج حفظاً بعد صمت ──
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (revision === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => storeRef.current?.save(), SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [revision]);

  /** حفظ عند مغادرة الصفحة (آخر تعديلات غير محفوظة) */
  useEffect(() => {
    const onLeave = () => storeRef.current?.save();
    window.addEventListener('pagehide', onLeave);
    return () => window.removeEventListener('pagehide', onLeave);
  }, []);

  // ── اللوحة والتحديد ──

  const open = useCallback(() => setPanelOpen(true), []);
  const close = useCallback(() => {
    setPanelOpen(false);
    setSelectedId(null);
  }, []);
  const toggle = useCallback(() => {
    if (panelOpenRef.current) close();
    else open();
  }, [open, close]);

  const select = useCallback((itemId: string | null) => setSelectedId(itemId), []);

  const setActiveSlide = useCallback((slideId: string | null) => {
    if (activeSlideRef.current !== slideId) setSelectedId(null);
    setActiveSlideId(slideId);
  }, []);

  const registerRectProvider = useCallback((provider: (() => SlideRect) | null) => {
    rectProviderRef.current = provider;
  }, []);

  // ── عمليات العناصر ──

  const addAsset = useCallback(
    (assetId: string, center?: { x: number; y: number }, rect?: SlideRect) => {
      const slideId = activeSlideRef.current;
      const asset = assetById(assetId);
      if (!slideId || !asset) return;
      const item: PlacedEquipment = {
        id: newEquipmentId(),
        assetId,
        ...placeEquipment(asset, center, rect ?? rectProviderRef.current?.() ?? NOMINAL_RECT),
      };
      store.add(slideId, item);
      setSelectedId(item.id);
      bump();
    },
    [store, bump],
  );

  const updateItem = useCallback(
    (itemId: string, patch: Partial<Pick<PlacedEquipment, 'x' | 'y' | 'w'>>) => {
      const slideId = activeSlideRef.current;
      if (!slideId) return;
      store.update(slideId, itemId, patch);
      bump();
    },
    [store, bump],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      const slideId = activeSlideRef.current;
      if (!slideId) return;
      if (store.remove(slideId, itemId)) {
        if (selectedRef.current === itemId) setSelectedId(null);
        bump();
      }
    },
    [store, bump],
  );

  const removeSelected = useCallback(() => {
    if (selectedRef.current) removeItem(selectedRef.current);
  }, [removeItem]);

  const clearActiveSlide = useCallback(() => {
    const slideId = activeSlideRef.current;
    if (!slideId) return;
    if (store.clearSlide(slideId)) {
      setSelectedId(null);
      bump();
    }
  }, [store, bump]);

  const beginGesture = useCallback(() => store.begin(), [store]);
  const endGesture = useCallback(() => {
    store.commit();
    bump();
  }, [store, bump]);

  const nudgeSelected = useCallback(
    (dx: number, dy: number) => {
      const slideId = activeSlideRef.current;
      const itemId = selectedRef.current;
      if (!slideId || !itemId) return;
      const item = store.itemsOf(slideId).find((entry) => entry.id === itemId);
      const asset = item && assetById(item.assetId);
      if (!item || !asset) return;
      const rect = rectProviderRef.current?.() ?? NOMINAL_RECT;
      store.update(slideId, itemId, clampPlacement(item.x + dx, item.y + dy, item.w, asset, rect));
      bump();
    },
    [store, bump],
  );

  const undo = useCallback(() => {
    if (!store.undo()) return;
    const slideId = activeSlideRef.current;
    if (selectedRef.current && !store.itemsOf(slideId ?? '').some((entry) => entry.id === selectedRef.current)) {
      setSelectedId(null);
    }
    bump();
  }, [store, bump]);

  const redo = useCallback(() => {
    if (store.redo()) bump();
  }, [store, bump]);

  // ── مفاتيح التحرير (أثناء فتح اللوحة فقط) ──
  // طور الالتقاط يسبق مستمع التنقّل العام: الأسهم تحرّك المحدد بدل تقليب
  // الشرائح، وDelete يحذف العنصر بدل مسح السبورة، وCtrl+Z/Ctrl+Y للتراجع.
  useEffect(() => {
    if (!panelOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (INTERACTIVE.has(target.tagName) || target.isContentEditable)) return;

      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
        } else if (key === 'y') {
          e.preventDefault();
          redo();
        }
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!selectedRef.current) return;

      const step = e.shiftKey ? NUDGE_LARGE : NUDGE;
      let handled = true;
      switch (e.key) {
        case 'ArrowLeft':
          nudgeSelected(-step, 0);
          break;
        case 'ArrowRight':
          nudgeSelected(step, 0);
          break;
        case 'ArrowUp':
          nudgeSelected(0, -step);
          break;
        case 'ArrowDown':
          nudgeSelected(0, step);
          break;
        case 'Delete':
        case 'Backspace':
          removeSelected();
          break;
        default:
          handled = false;
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [panelOpen, undo, redo, nudgeSelected, removeSelected]);

  return {
    panelOpen,
    selectedId,
    activeSlideId,
    revision,
    canUndo: store.canUndo,
    canRedo: store.canRedo,
    itemsOf: (slideId) => store.itemsOf(slideId),
    setActiveSlide,
    open,
    close,
    toggle,
    select,
    addAsset,
    updateItem,
    removeItem,
    removeSelected,
    clearActiveSlide,
    beginGesture,
    endGesture,
    nudgeSelected,
    registerRectProvider,
    undo,
    redo,
  };
}
