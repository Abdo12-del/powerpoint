/**
 * تشكيل النص العربي إلى مسارات SVG عبر HarfBuzz (WASM) — أساس مؤثر «الخط يُكتب» (CalligraphyText).
 *
 * لماذا HarfBuzz؟ المكتبات الأخف (opentype.js) تُسقط حروفاً وتُخطئ في الربط والتشكيل؛ HarfBuzz هو محرك
 * التشكيل نفسه المستعمل في المتصفحات، فينتج الأشكال السياقية والروابط (لام-ألف) ومواضع الحركات بدقة.
 *
 * المدخل: ملفات .woff (الحزم الثابتة من fontsource) تُفكّ في المتصفح بـ DecompressionStream، أو .ttf/.otf مباشرة.
 * المخرج: قائمة أشكال (glyphs) بمسار d بوحدات الخط + موضع، مرتبة بترتيب الكتابة (اليمين → اليسار) للرسم التدريجي.
 */
import type * as HB from 'harfbuzzjs';

export type FontBytesSource = string | Uint8Array | ArrayBuffer;

export interface ShaperFontSource {
  /** ملف الخط للمقاطع العربية (woff/ttf/otf) — رابط أو بايتات */
  arabic: FontBytesSource;
  /** ملف الخط للمقاطع اللاتينية/الأرقام الغربية/علامات الترقيم (اختياري؛ fontsource يفصلها عن العربية) */
  latin?: FontBytesSource;
  /** محاور الخط المتغيّر إن كان الملف متغيّراً: { wght: 700 } */
  variations?: Record<string, number>;
}

export interface ShapedGlyph {
  /** مسار SVG بوحدات الخط (y إلى الأعلى) */
  d: string;
  /** موضع نقطة الأصل بالبكسل (x من اليسار، y = خط الأساس) */
  x: number;
  y: number;
  /** مقياس وحدات الخط → بكسل */
  scale: number;
  /** عرض التقدّم بالبكسل */
  advance: number;
  cluster: number;
  /** رقم المقطع (run) */
  run: number;
  /** ترتيب الكتابة (0 = أول ما يُكتب) */
  order: number;
}

export interface ShapedText {
  glyphs: ShapedGlyph[];
  width: number;
  height: number;
  /** موضع خط الأساس من الأعلى بالبكسل */
  baseline: number;
  size: number;
}

export interface ShapeOptions {
  /** حجم الخط بالبكسل */
  size?: number;
  /** اتجاه الفقرة */
  dir?: 'rtl' | 'ltr';
  /** ميزات OpenType إضافية مثل 'dlig' أو 'ss01' (الأساسية liga/calt/kern/mark/mkmk مفعّلة في HarfBuzz افتراضياً) */
  features?: string[];
}

interface ShaperFace {
  font: HB.Font;
  face: HB.Face;
  upem: number;
  ascender: number;
  descender: number;
}

export interface ShaperFont {
  arabic: ShaperFace;
  latin?: ShaperFace;
}

let hbModule: Promise<typeof HB> | undefined;

/** تحميل HarfBuzz (WASM ≈ 430KB) مرة واحدة — chunk كسول */
export function loadHarfBuzz(): Promise<typeof HB> {
  return (hbModule ??= import('harfbuzzjs'));
}

const WOFF_SIGNATURE = 0x774f4646; // 'wOFF'
const WOFF2_SIGNATURE = 0x774f4632; // 'wOF2'

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') throw new Error('DecompressionStream غير متاح — استعمل ملف .ttf/.otf بدل .woff');
  const stream = new Response(data as BufferSource).body!.pipeThrough(new DecompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** تحويل WOFF (zlib) إلى SFNT خام يفهمه HarfBuzz. يعيد البايتات كما هي إن لم تكن WOFF. */
export async function woffToSfnt(input: Uint8Array): Promise<Uint8Array> {
  const dv = new DataView(input.buffer, input.byteOffset, input.byteLength);
  const sig = dv.getUint32(0);
  if (sig === WOFF2_SIGNATURE) throw new Error('WOFF2 يحتاج فكّ Brotli — استعمل ملف .woff أو .ttf (الحزم الثابتة من fontsource تشمل .woff)');
  if (sig !== WOFF_SIGNATURE) return input;
  const flavor = dv.getUint32(4);
  const numTables = dv.getUint16(12);
  const entries = Array.from({ length: numTables }, (_, i) => {
    const o = 44 + i * 20;
    return {
      tag: dv.getUint32(o),
      offset: dv.getUint32(o + 4),
      compLength: dv.getUint32(o + 8),
      origLength: dv.getUint32(o + 12),
      checksum: dv.getUint32(o + 16),
    };
  });
  const tables = await Promise.all(
    entries.map(async (e) => {
      const raw = input.subarray(e.offset, e.offset + e.compLength);
      const data = e.compLength === e.origLength ? raw : await inflate(raw);
      return { ...e, data, padded: (data.length + 3) & ~3 };
    }),
  );
  const headerSize = 12 + 16 * numTables;
  const out = new Uint8Array(headerSize + tables.reduce((n, t) => n + t.padded, 0));
  const odv = new DataView(out.buffer);
  const entrySelector = Math.floor(Math.log2(numTables));
  const searchRange = 16 * 2 ** entrySelector;
  odv.setUint32(0, flavor);
  odv.setUint16(4, numTables);
  odv.setUint16(6, searchRange);
  odv.setUint16(8, entrySelector);
  odv.setUint16(10, numTables * 16 - searchRange);
  let offset = headerSize;
  tables.forEach((t, i) => {
    const e = 12 + i * 16;
    odv.setUint32(e, t.tag);
    odv.setUint32(e + 4, t.checksum);
    odv.setUint32(e + 8, offset);
    odv.setUint32(e + 12, t.data.length);
    out.set(t.data, offset);
    offset += t.padded;
  });
  return out;
}

async function toBytes(src: FontBytesSource): Promise<Uint8Array> {
  if (typeof src === 'string') {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`تعذّر تحميل ملف الخط ${src} (${res.status})`);
    return new Uint8Array(await res.arrayBuffer());
  }
  return src instanceof Uint8Array ? src : new Uint8Array(src);
}

const faceCache = new Map<string, Promise<ShaperFace>>();

async function loadFace(hb: typeof HB, src: FontBytesSource, variations?: Record<string, number>): Promise<ShaperFace> {
  const key = typeof src === 'string' ? `${src}|${JSON.stringify(variations ?? {})}` : '';
  const build = async (): Promise<ShaperFace> => {
    const sfnt = await woffToSfnt(await toBytes(src));
    const face = new hb.Face(new hb.Blob(sfnt));
    const font = new hb.Font(face);
    const upem = face.upem;
    font.setScale(upem, upem);
    if (variations) font.setVariations(Object.entries(variations).map(([tag, value]) => new hb.Variation(tag, value)));
    const ext = font.hExtents();
    return { font, face, upem, ascender: ext.ascender, descender: ext.descender };
  };
  if (!key) return build();
  let p = faceCache.get(key);
  if (!p) {
    p = build();
    faceCache.set(key, p);
    p.catch(() => faceCache.delete(key));
  }
  return p;
}

/** تحميل خط للتشكيل (مع تخزين مؤقت حسب الرابط) */
export async function loadShaperFont(source: ShaperFontSource): Promise<ShaperFont> {
  const hb = await loadHarfBuzz();
  const [arabic, latin] = await Promise.all([
    loadFace(hb, source.arabic, source.variations),
    source.latin ? loadFace(hb, source.latin, source.variations) : undefined,
  ]);
  return { arabic, latin };
}

// ——— خوارزمية اتجاه مبسّطة (تكفي العناوين): مقاطع عربية RTL، ولاتينية/أرقام LTR، والمحايد يتبع جاره ———

type CharClass = 'R' | 'L' | 'AN' | 'EN' | 'N';

export function classifyChar(cp: number): CharClass {
  if ((cp >= 0x0660 && cp <= 0x0669) || (cp >= 0x06f0 && cp <= 0x06f9)) return 'AN';
  if (cp >= 0x0030 && cp <= 0x0039) return 'EN';
  if (
    (cp >= 0x0600 && cp <= 0x06ff) ||
    (cp >= 0x0750 && cp <= 0x077f) ||
    (cp >= 0x0870 && cp <= 0x08ff) ||
    (cp >= 0xfb50 && cp <= 0xfdff) ||
    (cp >= 0xfe70 && cp <= 0xfeff) ||
    (cp >= 0x0590 && cp <= 0x05ff)
  )
    return 'R';
  if ((cp >= 0x0041 && cp <= 0x005a) || (cp >= 0x0061 && cp <= 0x007a) || (cp >= 0x00c0 && cp <= 0x024f) || (cp >= 0x0370 && cp <= 0x052f))
    return 'L';
  return 'N';
}

export interface TextRun {
  text: string;
  dir: 'rtl' | 'ltr';
  script: 'arab' | 'latn';
  start: number;
}

/** تقسيم النص إلى مقاطع متجانسة الاتجاه والنص (script) */
export function splitRuns(text: string, dir: 'rtl' | 'ltr' = 'rtl'): TextRun[] {
  const chars = Array.from(text);
  const classes = chars.map((c) => classifyChar(c.codePointAt(0)!));
  // حلّ المحايد (قاعدة N1 من UAX#9): يتبع الجارين إن اتفقا وإلا اتجاه الفقرة؛ الأرقام تُعامل كـ R عند حلّ المحايد
  const resolved: ('rtl' | 'ltr')[] = classes.map((c) => (c === 'R' ? 'rtl' : c === 'L' || c === 'EN' || c === 'AN' ? 'ltr' : dir));
  const strongOf = (c: CharClass): 'rtl' | 'ltr' => (c === 'L' ? 'ltr' : 'rtl');
  for (let i = 0; i < classes.length; i++) {
    if (classes[i] !== 'N') continue;
    let p = i - 1;
    while (p >= 0 && classes[p] === 'N') p--;
    let n = i + 1;
    while (n < classes.length && classes[n] === 'N') n++;
    const prev = p >= 0 ? strongOf(classes[p]) : dir;
    const next = n < classes.length ? strongOf(classes[n]) : dir;
    resolved[i] = prev === next ? prev : dir;
  }
  // الأرقام العربية-الهندية تُرسم بالخط العربي (توجد في المقطع العربي)، والغربية واللاتينية بالخط اللاتيني
  const scripts: ('arab' | 'latn')[] = classes.map((c, i) =>
    c === 'R' || c === 'AN' ? 'arab' : c === 'L' || c === 'EN' ? 'latn' : resolved[i] === 'rtl' ? 'arab' : 'latn',
  );
  const runs: TextRun[] = [];
  let pos = 0;
  chars.forEach((ch, i) => {
    const last = runs.at(-1);
    if (last && last.dir === resolved[i] && last.script === scripts[i]) last.text += ch;
    else runs.push({ text: ch, dir: resolved[i], script: scripts[i], start: pos });
    pos += ch.length;
  });
  return runs;
}

/** تشكيل النص ووضعه: يعيد الأشكال بترتيب الكتابة مع مواضعها بالبكسل */
export async function shapeText(text: string, font: ShaperFont, options: ShapeOptions = {}): Promise<ShapedText> {
  const hb = await loadHarfBuzz();
  const size = options.size ?? 72;
  const dir = options.dir ?? 'rtl';
  const features = (options.features ?? []).map((f) => new hb.Feature(f));
  const runs = splitRuns(text, dir);
  // كل مقطع قد ينقسم إلى أجزاء بحسب الملف الذي يملك الحرف فعلاً (مثلاً «—» غائب من المقطع العربي فيُؤخذ من اللاتيني)
  const segments: { run: TextRun; runIndex: number; text: string; start: number; face: ShaperFace }[] = [];
  runs.forEach((run, runIndex) => {
    const preferred = run.script === 'latn' && font.latin ? font.latin : font.arabic;
    const other = preferred === font.arabic ? font.latin : font.arabic;
    let pos = 0;
    for (const ch of Array.from(run.text)) {
      const cp = ch.codePointAt(0)!;
      const last = segments.at(-1);
      let face = last && last.runIndex === runIndex ? last.face : preferred;
      if (ch.trim()) {
        if (preferred.font.nominalGlyph(cp) !== undefined) face = preferred;
        else if (other && other.font.nominalGlyph(cp) !== undefined) face = other;
        else face = preferred;
      }
      if (last && last.runIndex === runIndex && last.face === face) last.text += ch;
      else segments.push({ run, runIndex, text: ch, start: run.start + pos, face });
      pos += ch.length;
    }
  });
  const shapedRuns = segments.map(({ run, runIndex, text: segText, start, face }) => {
    const buffer = new hb.Buffer();
    buffer.addText(segText);
    buffer.setDirection(run.dir === 'rtl' ? hb.Direction.RTL : hb.Direction.LTR);
    buffer.setScript(run.script === 'arab' ? 'Arab' : 'Latn');
    buffer.setLanguage(run.script === 'arab' ? 'ar' : 'en');
    hb.shape(face.font, buffer, features);
    const infos = buffer.getGlyphInfos();
    const positions = buffer.getGlyphPositions();
    const s = size / face.upem;
    let x = 0;
    const glyphs = infos.map((info, i) => {
      const p = positions[i];
      const g = {
        d: face.font.glyphToPath(info.codepoint),
        x: x + p.xOffset * s,
        yOff: p.yOffset * s,
        scale: s,
        advance: p.xAdvance * s,
        cluster: start + info.cluster,
      };
      x += p.xAdvance * s;
      return g;
    });
    return { run, runIndex, glyphs, width: x, face };
  });
  const width = shapedRuns.reduce((n, r) => n + r.width, 0);
  const ascent = Math.max(...shapedRuns.map((r) => (r.face.ascender * size) / r.face.upem), font.arabic.ascender * (size / font.arabic.upem));
  const descent = Math.max(...shapedRuns.map((r) => (-r.face.descender * size) / r.face.upem), -font.arabic.descender * (size / font.arabic.upem));
  const baseline = ascent;
  const glyphs: ShapedGlyph[] = [];
  let order = 0;
  let cursor = dir === 'rtl' ? width : 0;
  for (const sr of shapedRuns) {
    const startX = dir === 'rtl' ? cursor - sr.width : cursor;
    // HarfBuzz يُخرج المقطع RTL بترتيب بصري (يسار→يمين)؛ ترتيب الكتابة هو العكس
    const writingOrder = sr.run.dir === 'rtl' ? [...sr.glyphs].reverse() : sr.glyphs;
    for (const g of writingOrder) {
      if (!g.d) continue; // مسافة أو شكل فارغ
      glyphs.push({
        d: g.d,
        x: startX + g.x,
        y: baseline - g.yOff,
        scale: g.scale,
        advance: g.advance,
        cluster: g.cluster,
        run: sr.runIndex,
        order: order++,
      });
    }
    cursor = dir === 'rtl' ? startX : cursor + sr.width;
  }
  return { glyphs, width, height: ascent + descent, baseline, size };
}

/** تحويل نتيجة التشكيل إلى مسار SVG واحد (للأقنعة أو التصدير) */
export function shapedToSvgPath(shaped: ShapedText): string {
  return shaped.glyphs
    .map((g) => `<path transform="translate(${g.x.toFixed(2)} ${g.y.toFixed(2)}) scale(${g.scale.toFixed(5)} ${(-g.scale).toFixed(5)})" d="${g.d}"/>`)
    .join('');
}
