import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { classifyChar, loadShaperFont, shapeText, shapedToSvgPath, splitRuns, woffToSfnt } from '@/lib/text-shaper';
import { CALLIGRAPHY_FONTS, CALLIGRAPHY_FONT_IDS, CALLIGRAPHY_FONT_LIST, calligraphySource } from '@/fonts/calligraphy';
import { FONTS } from '@/fonts/registry';

const woff = (p: string) => new Uint8Array(readFileSync(`node_modules/@fontsource/${p}`));
const AREF = { arabic: woff('aref-ruqaa/files/aref-ruqaa-arabic-400-normal.woff'), latin: woff('aref-ruqaa/files/aref-ruqaa-latin-400-normal.woff') };

describe('تقسيم الاتجاه (bidi مبسّط)', () => {
  it('يصنّف الحروف العربية واللاتينية والأرقام', () => {
    expect(classifyChar('ب'.codePointAt(0)!)).toBe('R');
    expect(classifyChar('A'.codePointAt(0)!)).toBe('L');
    expect(classifyChar('٣'.codePointAt(0)!)).toBe('AN');
    expect(classifyChar('3'.codePointAt(0)!)).toBe('EN');
    expect(classifyChar(' '.codePointAt(0)!)).toBe('N');
  });

  it('نص عربي خالص = مقطع واحد RTL؛ الأرقام واللاتيني مقاطع LTR مستقلة', () => {
    expect(splitRuns('بسم الله الرحمن الرحيم')).toEqual([{ text: 'بسم الله الرحمن الرحيم', dir: 'rtl', script: 'arab', start: 0 }]);
    const runs = splitRuns('دفعة 2026 — React');
    expect(runs.map((r) => [r.text, r.dir, r.script])).toEqual([
      ['دفعة ', 'rtl', 'arab'],
      ['2026', 'ltr', 'latn'],
      [' — ', 'rtl', 'arab'],
      ['React', 'ltr', 'latn'],
    ]);
    // الأرقام العربية-الهندية تبقى بالخط العربي لكن باتجاه LTR
    expect(splitRuns('سنة ٢٠٢٦').map((r) => [r.text, r.dir, r.script])).toEqual([
      ['سنة ', 'rtl', 'arab'],
      ['٢٠٢٦', 'ltr', 'arab'],
    ]);
  });
});

describe('تشكيل HarfBuzz إلى مسارات SVG', () => {
  it('يفكّ WOFF إلى SFNT صالح', async () => {
    const sfnt = await woffToSfnt(AREF.arabic);
    const dv = new DataView(sfnt.buffer);
    expect([0x00010000, 0x4f54544f]).toContain(dv.getUint32(0)); // TrueType أو 'OTTO'
    expect(dv.getUint16(4)).toBeGreaterThan(5); // عدد الجداول
    expect(await woffToSfnt(sfnt)).toBe(sfnt); // ليس WOFF → كما هو
  });

  it('يشكّل البسملة بالرقعة: أشكال متصلة بترتيب الكتابة من اليمين', async () => {
    const font = await loadShaperFont(AREF);
    const shaped = await shapeText('بسم الله الرحمن الرحيم', font, { size: 72 });
    expect(shaped.width).toBeGreaterThan(300);
    expect(shaped.height).toBeGreaterThan(72);
    expect(shaped.glyphs.length).toBeGreaterThan(10);
    expect(shaped.glyphs.every((g) => g.d.length > 10)).toBe(true);
    // ترتيب الكتابة: أول شكل هو الأيمن (x أكبر) وآخر شكل هو الأيسر
    expect(shaped.glyphs[0].x).toBeGreaterThan(shaped.glyphs.at(-1)!.x);
    expect(shaped.glyphs.map((g) => g.order)).toEqual(shaped.glyphs.map((_, i) => i));
    // الحروف غير منفصلة: عدد الأشكال أقل من عدد الحروف + الحركات (روابط) أو مساوٍ له
    expect(shaped.glyphs.length).toBeLessThanOrEqual('بسم الله الرحمن الرحيم'.replace(/\s/g, '').length + 2);
    expect(shapedToSvgPath(shaped)).toContain('<path transform="translate(');
  });

  it('الأرقام الغربية تُرسم LTR من الملف اللاتيني وتظهر يسار الكلمة العربية', async () => {
    const font = await loadShaperFont(AREF);
    const shaped = await shapeText('دفعة 2026', font, { size: 60 });
    const digits = shaped.glyphs.filter((g) => g.run === 1);
    expect(digits.length).toBe(4);
    // داخل المقطع الرقمي: ترتيب الكتابة من اليسار إلى اليمين (2 ثم 0 ثم 2 ثم 6)
    expect(digits[0].x).toBeLessThan(digits[3].x);
    const arabicMaxX = Math.max(...shaped.glyphs.filter((g) => g.run === 0).map((g) => g.x));
    expect(Math.max(...digits.map((g) => g.x))).toBeLessThan(arabicMaxX);
  });

  it('الحرف الغائب من المقطع العربي (—) يُؤخذ من الملف اللاتيني بدل مربع فارغ', async () => {
    const font = await loadShaperFont(AREF);
    const shaped = await shapeText('أ — ب', font, { size: 60 });
    // أ = ألف + همزة (شكلان)، — شكل واحد من اللاتيني، ب = جسم + نقطة (شكلان)
    expect(shaped.glyphs.length).toBe(5);
    const notdef = font.arabic.font.glyphToPath(0);
    expect(shaped.glyphs.some((g) => g.d === notdef)).toBe(false);
    const dash = shaped.glyphs.find((g) => g.cluster === 2)!;
    expect(dash.scale).toBeCloseTo(60 / font.latin!.upem, 6);
    // الشرطة تقع بين الألف (يمين) والباء (يسار)
    expect(dash.x).toBeLessThan(shaped.glyphs[0].x);
    expect(dash.x).toBeGreaterThan(shaped.glyphs.at(-1)!.x);
  });

  it('خط بلا ملف لاتيني يعمل على النص العربي ويتجاوز WOFF2', async () => {
    const font = await loadShaperFont({ arabic: woff('katibeh/files/katibeh-arabic-400-normal.woff') });
    const shaped = await shapeText('كاتبة', font, { size: 48, dir: 'rtl' });
    expect(shaped.glyphs.length).toBeGreaterThanOrEqual(4);
    await expect(woffToSfnt(new Uint8Array([0x77, 0x4f, 0x46, 0x32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))).rejects.toThrow(/WOFF2/);
  });
});

describe('قائمة خطوط الكتابة', () => {
  it('كل خط يشير إلى السجل العام وله ملفات لوزن 400 على الأقل', () => {
    expect(CALLIGRAPHY_FONT_LIST.length).toBe(CALLIGRAPHY_FONT_IDS.length);
    for (const def of CALLIGRAPHY_FONT_LIST) {
      expect(FONTS[def.fontId]).toBeDefined();
      expect(FONTS[def.fontId].variable).toBe(false);
      expect(def.weights[400]).toBeDefined();
      expect(typeof def.weights[400].arabic).toBe('string');
      expect(def.penWidth).toBeGreaterThan(0);
    }
    expect(CALLIGRAPHY_FONTS['aref-ruqaa'].weights[700]).toBeDefined();
    expect(calligraphySource('katibeh', 700)).toBe(CALLIGRAPHY_FONTS.katibeh.weights[400]);
    expect(calligraphySource('almarai', 700)).toBe(CALLIGRAPHY_FONTS.almarai.weights[800]);
  });
});
