/**
 * مخزن المعدات العلمية — نموذج نقي (بلا React) على نمط chalkboard/store.ts:
 * عناصر لكل شريحة (بمفتاح slide.id الثابت) + تراجع/إعادة + حفظ محلي.
 * لقطات التراجع صغيرة (بيانات إحداثيات فقط) وتُحدّ بـ HISTORY_LIMIT.
 */
import { assetById } from './catalog';
import { HISTORY_LIMIT, MAX_WIDTH, MIN_WIDTH, STORAGE_KEY } from './types';
import type { EquipmentPersist, PlacedEquipment } from './types';

export { STORAGE_KEY };

type SlidesMap = Record<string, PlacedEquipment[]>;

/** هل يمكن الحفظ محلياً؟ (بيئات خاصة قد تمنعه) */
function safeLocalStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

function cloneSlides(slides: SlidesMap): SlidesMap {
  return JSON.parse(JSON.stringify(slides)) as SlidesMap;
}

/** عنصر صالح: معرفات نصية، أصل معروف، وأرقام منتهية */
function isValidItem(value: unknown): value is PlacedEquipment {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.assetId === 'string' &&
    assetById(item.assetId) !== undefined &&
    typeof item.x === 'number' && Number.isFinite(item.x) &&
    typeof item.y === 'number' && Number.isFinite(item.y) &&
    typeof item.w === 'number' && Number.isFinite(item.w)
  );
}

/** تحميل الحالة المحفوظة — null عند الغياب أو التلف (يُبدأ نظيفاً) */
export function loadPersist(): EquipmentPersist | null {
  const storage = safeLocalStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as EquipmentPersist;
    if (data?.version !== 1 || typeof data.slides !== 'object' || data.slides === null || Array.isArray(data.slides)) {
      return null;
    }
    const slides: SlidesMap = {};
    for (const [slideId, items] of Object.entries(data.slides)) {
      if (!Array.isArray(items)) continue;
      const clean = items.filter(isValidItem).map((item) => ({
        id: item.id,
        assetId: item.assetId,
        x: Math.min(Math.max(item.x, 0), 1),
        y: Math.min(Math.max(item.y, 0), 1),
        w: Math.min(Math.max(item.w, MIN_WIDTH), MAX_WIDTH),
      }));
      if (clean.length > 0) slides[slideId] = clean;
    }
    return { version: 1, slides };
  } catch {
    return null; // JSON تالف → نتجاهله بهدوء
  }
}

/** حفظ الحالة — صامت عند غياب التخزين أو امتلائه */
export function savePersist(data: EquipmentPersist): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* تجاهل: حصص التخزين ممتلئة أو محجوبة */
  }
}

/** مسح كل العناصر المحفوظة */
export function clearPersisted(): void {
  safeLocalStorage()?.removeItem(STORAGE_KEY);
}

let idCounter = 0;

/** معرف نسخة فريد (crypto.randomUUID حيث يتوفر) */
export function newEquipmentId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return `eq-${c.randomUUID()}`;
  idCounter += 1;
  return `eq-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

/**
 * مخزن العناصر — كل التلاعب يمرّ من هنا ليبقى الاختبار حتمياً.
 * التراجع/الإعادة يعملان بلقطات كاملة (البيانات صغيرة)، والإيماءات
 * (سحب/تحجيم) تُجمَّع في خطوة تراجع واحدة عبر begin/commit.
 */
export class EquipmentStore {
  private slides: SlidesMap;
  private undoStack: SlidesMap[] = [];
  private redoStack: SlidesMap[] = [];
  private gesture: SlidesMap | null = null;

  constructor(data?: EquipmentPersist | null) {
    this.slides = data ? cloneSlides(data.slides) : {};
  }

  static fromStorage(): EquipmentStore {
    return new EquipmentStore(loadPersist());
  }

  itemsOf(slideId: string): PlacedEquipment[] {
    return this.slides[slideId] ?? [];
  }

  countOf(slideId: string): number {
    return this.itemsOf(slideId).length;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  add(slideId: string, item: PlacedEquipment): void {
    const prev = this.snapshot();
    const list = this.slides[slideId] ?? [];
    list.push(item);
    this.slides[slideId] = list;
    this.pushHistory(prev);
  }

  /** تحديث إحداثيات عنصر. أثناء إيماءة مفتوحة لا يُسجَّل تاريخ (تجمعه commit) */
  update(slideId: string, itemId: string, patch: Partial<Pick<PlacedEquipment, 'x' | 'y' | 'w'>>): void {
    const item = this.slides[slideId]?.find((entry) => entry.id === itemId);
    if (!item) return;
    const prev = this.gesture ? null : this.snapshot();
    Object.assign(item, patch);
    if (prev) this.pushHistory(prev);
  }

  remove(slideId: string, itemId: string): boolean {
    const list = this.slides[slideId];
    if (!list?.some((entry) => entry.id === itemId)) return false;
    const prev = this.snapshot();
    const next = list.filter((entry) => entry.id !== itemId);
    if (next.length > 0) this.slides[slideId] = next;
    else delete this.slides[slideId];
    this.pushHistory(prev);
    return true;
  }

  clearSlide(slideId: string): boolean {
    if (!this.slides[slideId]?.length) return false;
    const prev = this.snapshot();
    delete this.slides[slideId];
    this.pushHistory(prev);
    return true;
  }

  // ── الإيماءات: سحب/تحجيم = خطوة تراجع واحدة ──

  begin(): void {
    if (!this.gesture) this.gesture = this.snapshot();
  }

  commit(): void {
    if (!this.gesture) return;
    if (JSON.stringify(this.gesture) !== JSON.stringify(this.slides)) this.pushHistory(this.gesture);
    this.gesture = null;
  }

  // ── التراجع/الإعادة ──

  undo(): boolean {
    const prev = this.undoStack.pop();
    if (!prev) return false;
    this.redoStack.push(this.snapshot());
    this.slides = prev;
    return true;
  }

  redo(): boolean {
    const next = this.redoStack.pop();
    if (!next) return false;
    this.undoStack.push(this.snapshot());
    this.slides = next;
    return true;
  }

  // ── الحفظ ──

  toPersist(): EquipmentPersist {
    return { version: 1, slides: this.snapshot() };
  }

  save(): void {
    savePersist(this.toPersist());
  }

  private snapshot(): SlidesMap {
    return cloneSlides(this.slides);
  }

  private pushHistory(prev: SlidesMap): void {
    this.undoStack.push(prev);
    if (this.undoStack.length > HISTORY_LIMIT) this.undoStack.shift();
    this.redoStack = [];
  }
}
