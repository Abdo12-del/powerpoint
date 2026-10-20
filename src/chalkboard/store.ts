/**
 * مخزن السبورة — نموذج نقي (بلا React ولا DOM)
 * يدير: خطوط التعليق لكل شاشة + صفحات السبورة المستقلة + الحفظ المحلي
 */

import { INITIAL_BOARD_PAGES, STORAGE_KEY } from './types';
import type { ChalkStroke, ChalkboardPersist } from './types';

export { STORAGE_KEY };

/**
 * هل يمكن الحفظ محلياً؟ (jsdom قد يوفّره، بيئات خاصة تمنعه)
 */
function safeLocalStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/** تحميل الحالة المحفوظة — null عند الغياب أو التلف (يُبدأ نظيفاً) */
export function loadPersist(): ChalkboardPersist | null {
  const storage = safeLocalStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ChalkboardPersist;
    if (data?.version !== 1 || typeof data.notes !== 'object' || !Array.isArray(data.board)) return null;
    return data;
  } catch {
    return null; // JSON تالف → نتجاهله بهدوء
  }
}

/** حفظ الحالة — صامت عند غياب التخزين أو امتلائه */
export function savePersist(data: ChalkboardPersist): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* تجاهل: حصص التخزين ممتلئة أو محجوبة */
  }
}

/** مسح كل الرسومات المحفوظة */
export function clearPersisted(): void {
  safeLocalStorage()?.removeItem(STORAGE_KEY);
}

/**
 * مخزن السبورة — كل التلاعب يمرّ من هنا ليبقى الاختبار والتصدير حتميين
 */
export class ChalkboardStore {
  /** تعليقات الشاشات: screenKey ← خطوط */
  private notes = new Map<string, ChalkStroke[]>();
  /** صفحات السبورة المستقلة */
  private board: ChalkStroke[][];

  constructor(data?: ChalkboardPersist | null) {
    if (data) {
      for (const [key, strokes] of Object.entries(data.notes)) {
        this.notes.set(key, strokes.map((s) => ({ ...s, points: [...s.points] })));
      }
      this.board = data.board.map((page) => page.map((s) => ({ ...s, points: [...s.points] })));
    } else {
      this.board = Array.from({ length: INITIAL_BOARD_PAGES }, () => []);
    }
  }

  // ── التعليق فوق الشاشات ──

  notesOf(layerKey: string): ChalkStroke[] {
    return this.notes.get(layerKey) ?? [];
  }

  addNote(layerKey: string, stroke: ChalkStroke): void {
    const list = this.notes.get(layerKey) ?? [];
    list.push(stroke);
    this.notes.set(layerKey, list);
  }

  undoNote(layerKey: string): boolean {
    const list = this.notes.get(layerKey);
    if (!list?.length) return false;
    list.pop();
    return true;
  }

  clearNotes(layerKey: string): boolean {
    if (!this.notes.get(layerKey)?.length) return false;
    this.notes.set(layerKey, []);
    return true;
  }

  // ── السبورة المستقلة ──

  get boardPageCount(): number {
    return this.board.length;
  }

  boardOf(page: number): ChalkStroke[] {
    this.ensurePage(page);
    return this.board[page];
  }

  addBoardStroke(page: number, stroke: ChalkStroke): void {
    this.ensurePage(page);
    this.board[page].push(stroke);
  }

  undoBoard(page: number): boolean {
    this.ensurePage(page);
    const list = this.board[page];
    if (!list.length) return false;
    list.pop();
    return true;
  }

  clearBoard(page: number): boolean {
    this.ensurePage(page);
    if (!this.board[page].length) return false;
    this.board[page] = [];
    return true;
  }

  /** إضافة صفحة سبورة جديدة — تُرجع فهرسها */
  addBoardPage(): number {
    this.board.push([]);
    return this.board.length - 1;
  }

  private ensurePage(page: number): void {
    while (this.board.length <= page) this.board.push([]);
  }

  // ── التخزين ──

  toJSON(): ChalkboardPersist {
    const notes: Record<string, ChalkStroke[]> = {};
    this.notes.forEach((strokes, key) => {
      notes[key] = strokes;
    });
    return { version: 1, notes, board: this.board };
  }

  /** حفظ فوري */
  save(): void {
    savePersist(this.toJSON());
  }

  /** تحميل من التخزين — يدمج في مخزن جديد */
  static fromStorage(): ChalkboardStore {
    return new ChalkboardStore(loadPersist());
  }

  /** إحصاء للاختبارات: مجموع الخطوط (تعليق + سبورة) */
  get totalStrokes(): number {
    let n = 0;
    this.notes.forEach((s) => (n += s.length));
    this.board.forEach((s) => (n += s.length));
    return n;
  }
}
