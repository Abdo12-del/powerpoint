/**
 * خطاف السبورة — يربط المخزن النقي بحالة React
 * النمط + اللون + السُمك + صفحة السبورة + الحفظ المؤجّل + التصدير
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChalkboardStore, clearPersisted } from './store';
import { downloadDataURL, strokesToPNG } from './renderer';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_TOOL,
} from './types';
import type { ChalkboardMode, ChalkStroke, ChalkTool } from './types';
import type { ChalkboardController } from './controller-types';

/** تأخير الحفظ المؤجّل بعد آخر تعديل (ms) */
const SAVE_DEBOUNCE_MS = 400;

/**
 * خطاف السبورة — واجهة تحكم واحدة تُستعمل في العرض المباشر والمختبر
 */
export function useChalkboard(): ChalkboardController {
  const storeRef = useRef<ChalkboardStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = ChalkboardStore.fromStorage();
  }

  const [mode, setMode] = useState<ChalkboardMode>('off');
  const [tool, setTool] = useState<ChalkTool>(DEFAULT_TOOL);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [size, setSize] = useState<number>(DEFAULT_SIZE);
  const [boardPage, setBoardPage] = useState(0);
  // عدّاد المراجعة — يرتفع مع كل تعديل لإعادة رسم الطبقات
  const [revision, setRevision] = useState(0);
  const modeRef = useRef<ChalkboardMode>('off');
  modeRef.current = mode;

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

  const bump = useCallback(() => setRevision((r) => r + 1), []);

  // ── وضع العمل ──

  const toggleNotes = useCallback(() => {
    setMode((m) => (m === 'notes' ? 'off' : 'notes'));
  }, []);

  const toggleBoard = useCallback(() => {
    setMode((m) => {
      if (m !== 'board') setBoardPage((p) => Math.min(p, storeRef.current?.boardPageCount ?? 1) || 0);
      return m === 'board' ? 'off' : 'board';
    });
  }, []);

  const close = useCallback(() => setMode('off'), []);

  // ── التعليق ──

  const notesFor = useCallback(
    (layerKey: string): ChalkStroke[] => storeRef.current?.notesOf(layerKey) ?? [],
    [],
  );

  const commitNote = useCallback(
    (layerKey: string, stroke: ChalkStroke) => {
      storeRef.current?.addNote(layerKey, stroke);
      bump();
    },
    [bump],
  );

  // ── السبورة ──

  const boardStrokesFor = useCallback(
    (page: number): ChalkStroke[] => storeRef.current?.boardOf(page) ?? [],
    [],
  );

  const commitBoardStroke = useCallback(
    (page: number, stroke: ChalkStroke) => {
      storeRef.current?.addBoardStroke(page, stroke);
      bump();
    },
    [bump],
  );

  const nextPage = useCallback(() => {
    const store = storeRef.current;
    if (!store) return;
    // آخر صفحة + التالي = صفحة جديدة (كما تفعل إضافة chalkboard الأصلية)
    setBoardPage((p) => (p + 1 >= store.boardPageCount ? store.addBoardPage() : p + 1));
    bump();
  }, [bump]);

  const prevPage = useCallback(() => setBoardPage((p) => Math.max(p - 1, 0)), []);

  // ── تراجع/مسح حسب السياق (الوضع الحالي) ──

  const undo = useCallback(() => {
    const store = storeRef.current;
    if (!store) return;
    const changed = modeRef.current === 'board' ? store.undoBoard(boardPage) : store.undoNote(currentLayerRef.current);
    if (changed) bump();
  }, [boardPage, bump]);

  const clear = useCallback(() => {
    const store = storeRef.current;
    if (!store) return;
    const changed = modeRef.current === 'board' ? store.clearBoard(boardPage) : store.clearNotes(currentLayerRef.current);
    if (changed) bump();
  }, [boardPage, bump]);

  // الطبقة الحالية يضبطها المستهلك (الشاشة الفعّالة) عبر setLayer
  const currentLayerRef = useRef<string>('title');

  const setLayer = useCallback((layerKey: string) => {
    currentLayerRef.current = layerKey;
  }, []);

  // ── تصدير ومسح كامل ──

  const exportPNG = useCallback(() => {
    const store = storeRef.current;
    if (!store) return;
    const strokes = modeRef.current === 'board' ? store.boardOf(boardPage) : store.notesOf(currentLayerRef.current);
    const png = strokesToPNG(strokes, 1600, 900, modeRef.current === 'board' ? '#0b1220' : undefined);
    if (png) {
      downloadDataURL(png, modeRef.current === 'board' ? `chalkboard-page-${boardPage + 1}.png` : `annotation-${currentLayerRef.current}.png`);
    }
  }, [boardPage]);

  const resetAll = useCallback(() => {
    storeRef.current = new ChalkboardStore();
    clearPersisted();
    setBoardPage(0);
    bump();
  }, [bump]);

  const boardPageCount = storeRef.current?.boardPageCount ?? 1;

  return {
    mode,
    tool,
    color,
    size,
    boardPage,
    boardPageCount,
    revision,
    setTool,
    setColor,
    setSize,
    setLayer,
    notesFor,
    commitNote,
    boardStrokesFor,
    commitBoardStroke,
    nextPage,
    prevPage,
    undo,
    clear,
    toggleNotes,
    toggleBoard,
    close,
    exportPNG,
    resetAll,
  };
}
