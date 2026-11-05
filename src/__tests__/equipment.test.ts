// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { EQUIPMENT, assetById, matchesQuery } from '@/equipment/catalog';
import {
  EquipmentStore,
  STORAGE_KEY,
  clearPersisted,
  loadPersist,
  newEquipmentId,
  savePersist,
} from '@/equipment/store';
import {
  NOMINAL_RECT,
  clampPlacement,
  heightFraction,
  placeEquipment,
  relativePoint,
  widthFromPointer,
} from '@/equipment/geometry';
import { DEFAULT_WIDTH, EQUIPMENT_CATEGORIES, HISTORY_LIMIT, MAX_WIDTH, MIN_WIDTH } from '@/equipment/types';
import type { PlacedEquipment } from '@/equipment/types';

const RECT = { left: 100, top: 50, width: 1000, height: 600 };

function item(overrides: Partial<PlacedEquipment> = {}): PlacedEquipment {
  return { id: newEquipmentId(), assetId: 'beaker', x: 0.2, y: 0.2, w: DEFAULT_WIDTH, ...overrides };
}

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY);
});

describe('كتالوج المعدات العلمية', () => {
  it('يوفر عشرة أصول PNG محلية شفافة بأسماء عربية ومعرفات فريدة', () => {
    expect(EQUIPMENT).toHaveLength(10);
    const ids = EQUIPMENT.map((asset) => asset.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const asset of EQUIPMENT) {
      expect(asset.name.trim().length).toBeGreaterThan(0);
      expect(/[\u0600-\u06FF]/.test(asset.name)).toBe(true);
      expect(asset.src.endsWith('.png')).toBe(true);
      expect(asset.src.startsWith('http')).toBe(false); // محلي مجمّع، ليس رابطاً خارجياً
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
    }
  });

  it('يغطي المعدات المطلوبة: قوارير ومخابير وأنابيب وحاملها وكأس وماصة وطبق بتري ومجهر ونظارات ومصباح', () => {
    const ids = EQUIPMENT.map((asset) => asset.id);
    for (const required of [
      'erlenmeyer-flask',
      'graduated-cylinder',
      'beaker',
      'test-tube',
      'test-tube-rack',
      'dropper-pipette',
      'petri-dish',
      'microscope',
      'safety-goggles',
      'spirit-lamp',
    ]) {
      expect(ids).toContain(required);
    }
  });

  it('كل فئة معرّفة لها أصل واحد على الأقل، وكل أصل ينتمي لفئة معرّفة', () => {
    const categoryIds = EQUIPMENT_CATEGORIES.map((cat) => cat.id);
    for (const cat of categoryIds) {
      expect(EQUIPMENT.some((asset) => asset.category === cat)).toBe(true);
    }
    for (const asset of EQUIPMENT) {
      expect(categoryIds).toContain(asset.category);
    }
  });

  it('البحث يعمل بالعربية واللاتينية ويتسامح مع همزات الألف والتاء المربوطة', () => {
    expect(matchesQuery(assetById('microscope')!, 'مجهر')).toBe(true);
    expect(matchesQuery(assetById('microscope')!, 'microscope')).toBe(true);
    expect(matchesQuery(assetById('erlenmeyer-flask')!, 'قاروره')).toBe(true);
    expect(matchesQuery(assetById('safety-goggles')!, 'نظارات')).toBe(true);
    expect(matchesQuery(assetById('beaker')!, '')).toBe(true);
    expect(matchesQuery(assetById('beaker')!, 'xyz-لا-يوجد')).toBe(false);
  });
});

describe('هندسة الإحداثيات النسبية', () => {
  it('يحوّل نقطة بكسلية إلى كسور من مستطيل الشريحة', () => {
    const point = relativePoint(600, 350, RECT);
    expect(point.x).toBeCloseTo(0.5);
    expect(point.y).toBeCloseTo(0.5);
  });

  it('يشتق الارتفاع من العرض ونسبة الأصل وأبعاد الشريحة (بلا تشويه)', () => {
    const asset = assetById('beaker')!; // مربع 1:1
    const h = heightFraction(0.16, asset, RECT);
    expect(h).toBeCloseTo((0.16 * 1000) / 600);
  });

  it('يمركز العنصر حول نقطة الإفلات ويثبته داخل الحدود', () => {
    const asset = assetById('beaker')!;
    const center = placeEquipment(asset, { x: 0.5, y: 0.5 }, RECT);
    expect(center.w).toBe(DEFAULT_WIDTH);
    expect(center.x).toBeCloseTo(0.5 - DEFAULT_WIDTH / 2);
    expect(center.y).toBeCloseTo(0.5 - heightFraction(DEFAULT_WIDTH, asset, RECT) / 2);

    const corner = placeEquipment(asset, { x: 0, y: 0 }, RECT);
    expect(corner.x).toBe(0);
    expect(corner.y).toBe(0);

    const farCorner = placeEquipment(asset, { x: 1, y: 1 }, RECT);
    expect(farCorner.x).toBeCloseTo(1 - DEFAULT_WIDTH);
    expect(farCorner.y).toBeCloseTo(1 - heightFraction(DEFAULT_WIDTH, asset, RECT));
  });

  it('يبقي الموضع داخل الشريحة عند القصّ', () => {
    const asset = assetById('beaker')!;
    const pos = clampPlacement(-0.5, 2, 0.2, asset, RECT);
    expect(pos.x).toBe(0);
    expect(pos.y).toBeCloseTo(1 - heightFraction(0.2, asset, RECT));
  });

  it('التحجيم يحفظ نسبة الأبعاد ويحدّ بالحدود الدنيا/القصوى وبالحافتين اليمنى والسفلى', () => {
    const asset = assetById('beaker')!;
    const pos = { x: 0.2, y: 0.1 };
    // مؤشر عند 700px → عرض خام 0.5
    expect(widthFromPointer(pos, 800, asset, RECT)).toBeCloseTo(0.5);
    // مؤشر بعيد جداً → يقصّ عند الحد الأدنى من (الأقصى، الحافة اليمنى، الحافة السفلى)
    const maxByBottom = ((1 - pos.y) * RECT.height) / RECT.width;
    expect(widthFromPointer(pos, 100000, asset, RECT)).toBeCloseTo(Math.min(MAX_WIDTH, 1 - pos.x, maxByBottom));
    // مؤشر قبل الحافة اليسرى → الحد الأدنى
    expect(widthFromPointer(pos, -1000, asset, RECT)).toBe(MIN_WIDTH);
  });
});

describe('مخزن المعدات: إدراج وتحريك وحذف لكل شريحة', () => {
  it('يعزل عناصر كل شريحة بمفتاحها الثابت', () => {
    const store = new EquipmentStore();
    const a = item();
    const b = item({ assetId: 'microscope' });
    store.add('ch1-intro', a);
    store.add('ch2-method', b);
    expect(store.itemsOf('ch1-intro')).toEqual([a]);
    expect(store.itemsOf('ch2-method')).toEqual([b]);
    expect(store.itemsOf('ch3-results')).toEqual([]);
  });

  it('يحدّث الإحداثيات ويحذف العنصر ويمسح الشريحة', () => {
    const store = new EquipmentStore();
    const a = item();
    store.add('s1', a);
    store.update('s1', a.id, { x: 0.6, y: 0.4, w: 0.3 });
    expect(store.itemsOf('s1')[0]).toMatchObject({ x: 0.6, y: 0.4, w: 0.3 });
    expect(store.remove('s1', a.id)).toBe(true);
    expect(store.countOf('s1')).toBe(0);
    store.add('s1', item());
    store.add('s1', item());
    expect(store.clearSlide('s1')).toBe(true);
    expect(store.countOf('s1')).toBe(0);
    expect(store.clearSlide('s1')).toBe(false);
  });
});

describe('التراجع/الإعادة', () => {
  it('يتراجع عن الإدراج والتحريك والحذف ويعيد تنفيذها', () => {
    const store = new EquipmentStore();
    const a = item();
    expect(store.canUndo).toBe(false);
    store.add('s1', a);
    store.update('s1', a.id, { x: 0.7 });
    expect(store.itemsOf('s1')[0].x).toBe(0.7);
    expect(store.undo()).toBe(true); // التحريك
    expect(store.itemsOf('s1')[0].x).toBe(0.2);
    expect(store.undo()).toBe(true); // الإدراج
    expect(store.countOf('s1')).toBe(0);
    expect(store.canUndo).toBe(false);
    expect(store.redo()).toBe(true);
    expect(store.redo()).toBe(true);
    expect(store.itemsOf('s1')[0].x).toBe(0.7);
    expect(store.canRedo).toBe(false);
  });

  it('الإيماءة الواحدة (سحب/تحجيم) = خطوة تراجع واحدة', () => {
    const store = new EquipmentStore();
    const a = item();
    store.add('s1', a);
    store.begin();
    store.update('s1', a.id, { x: 0.3 });
    store.update('s1', a.id, { x: 0.4 });
    store.update('s1', a.id, { x: 0.5 });
    store.commit();
    expect(store.itemsOf('s1')[0].x).toBe(0.5);
    expect(store.undo()).toBe(true);
    expect(store.itemsOf('s1')[0].x).toBe(0.2); // العودة إلى ما قبل الإيماءة
    expect(store.undo()).toBe(true); // ثم الإدراج نفسه
    expect(store.countOf('s1')).toBe(0);
  });

  it('إيماءة بلا تغيير لا تضيف خطوة تراجع', () => {
    const store = new EquipmentStore();
    store.add('s1', item());
    const before = store.canUndo;
    store.begin();
    store.commit();
    expect(store.canUndo).toBe(before);
    expect(store.undo()).toBe(true);
    expect(store.canUndo).toBe(false);
  });

  it('عملية جديدة تمسح سلسلة الإعادة، والتاريخ محدود', () => {
    const store = new EquipmentStore();
    store.add('s1', item());
    store.undo();
    expect(store.canRedo).toBe(true);
    store.add('s1', item());
    expect(store.canRedo).toBe(false);

    const fresh = new EquipmentStore();
    for (let i = 0; i < HISTORY_LIMIT + 5; i += 1) fresh.add('s1', item());
    let undone = 0;
    while (fresh.undo()) undone += 1;
    expect(undone).toBe(HISTORY_LIMIT);
  });
});

describe('الحفظ المحلي', () => {
  it('يحفظ ويستعيد العناصر بمواضعها وأحجامها عبر إعادة التحميل', () => {
    const store = new EquipmentStore();
    const a = item({ x: 0.35, y: 0.45, w: 0.22 });
    store.add('ch1-intro', a);
    store.save();

    const loaded = loadPersist();
    expect(loaded?.version).toBe(1);
    const restored = new EquipmentStore(loaded);
    expect(restored.itemsOf('ch1-intro')).toEqual([a]);
  });

  it('يتجاهل JSON التالف أو النسخة الخاطئة بهدوء', () => {
    expect(loadPersist()).toBeNull();
    localStorage.setItem(STORAGE_KEY, '{تالف');
    expect(loadPersist()).toBeNull();
    savePersist({ version: 2 as unknown as 1, slides: {} });
    expect(loadPersist()).toBeNull();
  });

  it('يرشح الأصول غير المعروفة ويقصّ الإحداثيات الخارجة عن الحدود', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        slides: {
          s1: [
            { id: 'ok', assetId: 'beaker', x: 1.5, y: -0.2, w: 5 },
            { id: 'ghost', assetId: 'unknown-asset', x: 0.1, y: 0.1, w: 0.2 },
            { id: 'bad', assetId: 'beaker', x: 'NaN', y: 0, w: 0.2 },
          ],
        },
      }),
    );
    const loaded = loadPersist();
    expect(loaded?.slides.s1).toHaveLength(1);
    expect(loaded?.slides.s1[0]).toMatchObject({ id: 'ok', x: 1, y: 0, w: MAX_WIDTH });
    clearPersisted();
    expect(loadPersist()).toBeNull();
  });

  it('الأبعاد الاسمية تُستعمل قبل توفر حاوية حقيقية', () => {
    const asset = assetById('test-tube')!;
    const placed = placeEquipment(asset);
    expect(placed.x).toBeCloseTo(0.5 - DEFAULT_WIDTH / 2);
    expect(placed.y).toBeCloseTo(0.45 - heightFraction(DEFAULT_WIDTH, asset, NOMINAL_RECT) / 2);
  });
});
