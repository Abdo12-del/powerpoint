// @vitest-environment jsdom
import { readFileSync, readdirSync } from 'node:fs';
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

/** جذر المستودع لفحص أصول PNG/SVG الملتزمة فعلياً (vitest يعمل من جذر المشروع) */
const root = `${process.cwd()}/`;

const RECT = { left: 100, top: 50, width: 1000, height: 600 };

function item(overrides: Partial<PlacedEquipment> = {}): PlacedEquipment {
  return { id: newEquipmentId(), assetId: 'beaker', x: 0.2, y: 0.2, w: DEFAULT_WIDTH, ...overrides };
}

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY);
});

describe('كتالوج المعدات العلمية', () => {
  it('يوفر 65 أصلاً PNG محلياً شفافاً بأسماء عربية ومعرفات فريدة ثابتة', () => {
    expect(EQUIPMENT).toHaveLength(65);
    const ids = EQUIPMENT.map((asset) => asset.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const asset of EQUIPMENT) {
      expect(asset.name.trim().length).toBeGreaterThan(0);
      expect(/[\u0600-\u06FF]/.test(asset.name)).toBe(true);
      expect(asset.src.endsWith('.png')).toBe(true);
      expect(asset.src.startsWith('http')).toBe(false); // محلي مجمّع، ليس رابطاً خارجياً
      expect(asset.width).toBe(512);
      expect(asset.height).toBe(512);
      expect(asset.id).toMatch(/^[a-z0-9-]+$/); // معرفات ثابتة لا تنكسر في localStorage
      expect(asset.keywords.length).toBeGreaterThan(0);
    }
  });

  it('لكل أصل مصدر SVG وناتج PNG شفاف 512×512 موجودان في المستودع', () => {
    const svgFiles = new Set(readdirSync(root + 'src/equipment/assets/svg'));
    const pngFiles = new Set(readdirSync(root + 'src/equipment/assets/png'));
    let totalBytes = 0;
    for (const asset of EQUIPMENT) {
      expect(svgFiles.has(`${asset.id}.svg`)).toBe(true);
      expect(pngFiles.has(`${asset.id}.png`)).toBe(true);
      const png = readFileSync(root + `src/equipment/assets/png/${asset.id}.png`);
      expect(png.subarray(1, 4).toString()).toBe('PNG');
      expect(png.readUInt32BE(16)).toBe(512); // العرض في IHDR
      expect(png.readUInt32BE(20)).toBe(512); // الارتفاع في IHDR
      expect(png[25]).toBe(6); // RGBA = خلفية شفافة
      expect(png.byteLength).toBeLessThan(120 * 1024); // لا ملفات ضخمة بلا داعٍ
      totalBytes += png.byteLength;
    }
    // سقف معقول لكل حزمة الصور (65 صورة أصلية)
    expect(totalBytes).toBeLessThan(4 * 1024 * 1024);
  });

  it('يغطي الحد الأدنى للمعدات في كل تخصص علمي', () => {
    const ids = new Set(EQUIPMENT.map((asset) => asset.id));
    const required: Record<string, string[]> = {
      // الأصول العشرة القديمة — معرفاتها وفئاتها لم تتغيّر
      legacy: [
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
      ],
      // D02 — علوم المادة: الكيمياء
      chemistry: [
        'burette',
        'volumetric-flask',
        'round-bottom-flask',
        'separatory-funnel',
        'liebig-condenser',
        'filter-funnel',
        'watch-glass',
        'crucible',
        'mortar-pestle',
        'bunsen-burner',
        'tripod-gauze',
        'analytical-balance',
        'ph-meter',
        'magnetic-stirrer',
        'stirring-rod',
      ],
      // D02 — علوم المادة: الفيزياء
      physics: [
        'convex-lens',
        'concave-lens',
        'glass-prism',
        'spring',
        'pendulum',
        'slotted-weights',
        'vernier-caliper',
        'multimeter',
        'oscilloscope',
        'magnet',
        'tuning-fork',
        'thermometer',
        'stopwatch',
        'power-supply',
      ],
      // D04 — علوم الطبيعة والحياة
      biology: [
        'microscope-slide',
        'micropipette',
        'inoculation-loop',
        'dissecting-kit',
        'centrifuge',
        'autoclave',
        'incubator',
        'dna-helix',
        'cell-model',
        'microtube',
      ],
      // D05 — علوم الأرض والكون
      geology: [
        'geological-hammer',
        'hand-lens',
        'geological-compass',
        'rock-sample',
        'mineral-crystal',
        'fossil',
        'sieve',
      ],
      // D15 — علوم الصحة
      health: [
        'stethoscope',
        'syringe',
        'blood-pressure-monitor',
        'blood-tube',
        'tablets',
        'capsule',
        'medical-gloves',
        'face-mask',
        'heart-model',
      ],
    };
    for (const [field, list] of Object.entries(required)) {
      for (const id of list) expect({ field, id, found: ids.has(id) }).toMatchObject({ found: true });
    }
    // الأصول القديمة بقيت في فئاتها القديمة (لا تنكسر بيانات localStorage)
    expect(assetById('beaker')!.category).toBe('glassware');
    expect(assetById('microscope')!.category).toBe('devices');
    expect(assetById('spirit-lamp')!.category).toBe('heating');
  });

  it('كل فئة معرّفة لها أصل واحد على الأقل، وكل أصل ينتمي لفئة معرّفة', () => {
    const categoryIds = EQUIPMENT_CATEGORIES.map((cat) => cat.id);
    const expectedCounts: Record<string, number> = {
      glassware: 5,
      chemistry: 15,
      physics: 14,
      biology: 10,
      geology: 7,
      health: 9,
      tools: 2,
      devices: 1,
      safety: 1,
      heating: 1,
    };
    expect(categoryIds).toHaveLength(10);
    expect(new Set(categoryIds).size).toBe(10);
    for (const cat of categoryIds) {
      expect(EQUIPMENT.some((asset) => asset.category === cat)).toBe(true);
      expect(EQUIPMENT.filter((asset) => asset.category === cat)).toHaveLength(expectedCounts[cat]);
    }
    for (const asset of EQUIPMENT) {
      expect(categoryIds).toContain(asset.category);
    }
    expect(Object.values(expectedCounts).reduce((sum, n) => sum + n, 0)).toBe(EQUIPMENT.length);
  });

  it('البحث يعمل بالعربية والفرنسية وبمعرف الأصل ويتسامح مع الهمزات والتاء المربوطة', () => {
    // عربي
    expect(matchesQuery(assetById('microscope')!, 'مجهر')).toBe(true);
    expect(matchesQuery(assetById('erlenmeyer-flask')!, 'قاروره')).toBe(true);
    expect(matchesQuery(assetById('burette')!, 'سحاحة')).toBe(true);
    expect(matchesQuery(assetById('geological-hammer')!, 'مطرقة')).toBe(true);
    expect(matchesQuery(assetById('stethoscope')!, 'سماعة')).toBe(true);
    // فرنسي (بما في ذلك الحروف المشكّلة والمسافات)
    expect(matchesQuery(assetById('beaker')!, 'bécher')).toBe(true);
    expect(matchesQuery(assetById('beaker')!, 'becher')).toBe(true);
    expect(matchesQuery(assetById('burette')!, 'burette')).toBe(true);
    expect(matchesQuery(assetById('volumetric-flask')!, 'fiole jaugée')).toBe(true);
    expect(matchesQuery(assetById('centrifuge')!, 'centrifugeuse')).toBe(true);
    expect(matchesQuery(assetById('multimeter')!, 'multimètre')).toBe(true);
    expect(matchesQuery(assetById('oscilloscope')!, 'oscilloscope')).toBe(true);
    expect(matchesQuery(assetById('geological-hammer')!, 'marteau')).toBe(true);
    expect(matchesQuery(assetById('hand-lens')!, 'loupe')).toBe(true);
    expect(matchesQuery(assetById('geological-compass')!, 'boussole')).toBe(true);
    expect(matchesQuery(assetById('stethoscope')!, 'stéthoscope')).toBe(true);
    expect(matchesQuery(assetById('syringe')!, 'seringue')).toBe(true);
    expect(matchesQuery(assetById('blood-pressure-monitor')!, 'tensiomètre')).toBe(true);
    // بمعرف الأصل (كلمة واحدة أو معرف كامل)
    expect(matchesQuery(assetById('microscope-slide')!, 'microscope-slide')).toBe(true);
    expect(matchesQuery(assetById('microscope-slide')!, 'slide')).toBe(true);
    // سلوك الحالات الحدّية
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
