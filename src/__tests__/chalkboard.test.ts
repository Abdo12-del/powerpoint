// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ChalkboardStore,
  STORAGE_KEY,
  clearPersisted,
  loadPersist,
  savePersist,
} from '@/chalkboard/store';
import { drawStroke, renderStrokes, simplifyPoints, strokesToPNG } from '@/chalkboard/renderer';
import {
  CHALK_COLORS,
  ERASER_SCALE,
  MARKER_COLORS,
  STROKE_WIDTHS,
  STORAGE_KEY as KEY,
} from '@/chalkboard/types';
import type { ChalkStroke } from '@/chalkboard/types';

const pen = (points: ChalkStroke['points'], tool: ChalkStroke['tool'] = 'chalk', color = '#fff'): ChalkStroke => ({
  tool,
  color,
  size: 6,
  points,
});

const line = (n = 4): ChalkStroke['points'] =>
  Array.from({ length: n }, (_, i) => ({ x: i * 10, y: i * 5 }));

describe('مخزن السبورة — ChalkboardStore', () => {
  it('تعليق الشاشات: إضافة وتراجع ومسح', () => {
    const store = new ChalkboardStore();
    store.addNote('slide-1', pen(line()));
    store.addNote('slide-1', pen(line(3)));
    store.addNote('slide-2', pen(line()));
    expect(store.notesOf('slide-1')).toHaveLength(2);
    expect(store.undoNote('slide-1')).toBe(true);
    expect(store.notesOf('slide-1')).toHaveLength(1);
    expect(store.clearNotes('slide-2')).toBe(true);
    expect(store.notesOf('slide-2')).toHaveLength(0);
    // تراجع/مسح على طبقة فارغة: بلا فعل
    expect(store.undoNote('slide-2')).toBe(false);
    expect(store.clearNotes('slide-2')).toBe(false);
  });

  it('سبورة مستقلة: صفحات ابتدائية ورسم لكل صفحة', () => {
    const store = new ChalkboardStore();
    expect(store.boardPageCount).toBeGreaterThanOrEqual(3);
    store.addBoardStroke(0, pen(line()));
    store.addBoardStroke(1, pen(line(5)));
    expect(store.boardOf(0)).toHaveLength(1);
    expect(store.boardOf(1)).toHaveLength(1); // لو خطأ الصفحة لكانت 0
    expect(store.undoBoard(0)).toBe(true);
    expect(store.boardOf(0)).toHaveLength(0);
    expect(store.clearBoard(1)).toBe(true);
  });

  it('الصفحات تتمدد تلقائياً عند الطلب', () => {
    const store = new ChalkboardStore();
    store.addBoardStroke(6, pen(line()));
    expect(store.boardPageCount).toBe(7);
    expect(store.addBoardPage()).toBe(7);
    expect(store.boardPageCount).toBe(8);
  });

  it(' toJSON/fromJSON: دورة حفظ/تحميل تحفظ الخطوط', () => {
    const store = new ChalkboardStore();
    store.addNote('title', pen(line()));
    store.addBoardStroke(2, pen(line(6), 'marker', 'rgba(0,0,0,0.5)'));
    const restored = new ChalkboardStore(store.toJSON());
    expect(restored.notesOf('title')).toHaveLength(1);
    expect(restored.boardOf(2)).toHaveLength(1);
    expect(restored.boardOf(2)[0].points).toHaveLength(6);
    expect(restored.totalStrokes).toBe(2);
  });
});

describe('التخزين المحلي', () => {
  beforeEach(() => localStorage.removeItem(STORAGE_KEY));
  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  it('حفظ ثم تحميل يعيدان نفس الحالة', () => {
    const store = new ChalkboardStore();
    store.addNote('slide-3', pen(line(3)));
    savePersist(store.toJSON());
    const loaded = loadPersist();
    expect(loaded?.notes['slide-3']).toHaveLength(1);
    const restored = ChalkboardStore.fromStorage();
    expect(restored.notesOf('slide-3')).toHaveLength(1);
  });

  it('JSON تالف → null ونمزق نظيف', () => {
    localStorage.setItem(KEY, '{تالف!');
    expect(loadPersist()).toBeNull();
    const store = ChalkboardStore.fromStorage();
    expect(store.totalStrokes).toBe(0);
  });

  it('بنية غريبة (إصدار قديم/أنواع خاطئة) → null', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 99, notes: 'x', board: 5 }));
    expect(loadPersist()).toBeNull();
    localStorage.setItem(KEY, 'null');
    expect(loadPersist()).toBeNull();
  });

  it('clearPersisted يزيل المفتاح', () => {
    savePersist(new ChalkboardStore().toJSON());
    expect(localStorage.getItem(KEY)).not.toBeNull();
    clearPersisted();
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});

/** سياق Canvas وهمي يسجّل الاستدعاءات — للتأكد من منطق الرسم بلا بيئة حقيقية */
function fakeCtx() {
  const calls: Array<[string, unknown[]]> = [];
  const record = (name: string) => (...args: unknown[]) => {
    calls.push([name, args]);
  };
  const ctx = {
    canvas: { width: 800, height: 450 },
    globalCompositeOperation: 'source-over',
    globalAlpha: 1,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    lineCap: '',
    lineJoin: '',
    beginPath: record('beginPath'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    quadraticCurveTo: record('quadraticCurveTo'),
    arc: record('arc'),
    fill: record('fill'),
    stroke: record('stroke'),
    clearRect: record('clearRect'),
    fillRect: record('fillRect'),
    setTransform: record('setTransform'),
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

describe('مصيّر السبورة', () => {
  it('الطباشير: خط أملس بمنحنيات المنتصف', () => {
    const { ctx, calls } = fakeCtx();
    drawStroke(ctx, pen(line(5)));
    const names = calls.map((c) => c[0]);
    expect(names).toContain('beginPath');
    expect(names).toContain('quadraticCurveTo');
    expect(names).toContain('stroke');
    expect(ctx.globalCompositeOperation).toBe('source-over');
  });

  it('نقطة واحدة → نقطة (arc + fill)', () => {
    const { ctx, calls } = fakeCtx();
    drawStroke(ctx, pen([{ x: 5, y: 5 }]));
    const names = calls.map((c) => c[0]);
    expect(names).toContain('arc');
    expect(names).toContain('fill');
    expect(names).not.toContain('stroke');
  });

  it('الممحاة: destination-out بسُمك مضاعف', () => {
    const { ctx, calls } = fakeCtx();
    drawStroke(ctx, pen(line(4), 'eraser'));
    expect(ctx.globalCompositeOperation).toBe('destination-out');
    expect(ctx.lineWidth).toBe(6 * ERASER_SCALE);
    expect(calls.map((c) => c[0])).toContain('stroke');
  });

  it('renderStrokes يمسح ثم يرسم كل الخطوط بالترتيب', () => {
    const { ctx, calls } = fakeCtx();
    renderStrokes(ctx, [pen(line()), pen(line(3))]);
    const names = calls.map((c) => c[0]);
    expect(names.indexOf('clearRect')).toBe(0);
    expect(names.filter((n) => n === 'stroke')).toHaveLength(2);
  });

  it('خطوط طويلة تُبسَّط مع الحفاظ على الطرفين', () => {
    const many = Array.from({ length: 100 }, (_, i) => ({ x: i * 0.5, y: 0 }));
    const simple = simplifyPoints(many, 2);
    expect(simple.length).toBeLessThanOrEqual(30);
    expect(simple.length).toBeGreaterThan(2);
    expect(simple[0]).toEqual(many[0]);
    expect(simple[simple.length - 1]).toEqual(many[many.length - 1]);
  });

  it('strokesToPNG يفشل بهدوء في بيئة بلا Canvas حقيقي', () => {
    // jsdom بلا حزمة canvas: getContext يرجع null → undefined بلا رمي
    expect(strokesToPNG([pen(line())])).toBeUndefined();
  });
});

describe('الهوية الافتراضية', () => {
  it('لوحتا الألوان والسُمك مكتملة', () => {
    expect(CHALK_COLORS.length).toBe(6);
    expect(MARKER_COLORS.length).toBe(6);
    expect(STROKE_WIDTHS).toEqual([3, 6, 12]);
    expect(CHALK_COLORS[0].value).toBe('#f8fafc'); // أبيض الطباشير
  });
});
