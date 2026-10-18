/**
 * ملفات الخطوط القابلة للتشكيل إلى مسارات (مؤثر «الخط يُكتب» — CalligraphyText).
 * تقتصر على الحزم الثابتة لأنها توفّر .woff (zlib) يُفكّ في المتصفح؛ الخطوط المتغيّرة تأتي .woff2 فقط (Brotli).
 * لخط خاص: مرّر { arabic: '/fonts/my-thuluth.ttf' } مباشرة إلى CalligraphyText (ضع الملف في public/fonts/).
 */
import arefRuqaaAr400 from '@fontsource/aref-ruqaa/files/aref-ruqaa-arabic-400-normal.woff?url';
import arefRuqaaLa400 from '@fontsource/aref-ruqaa/files/aref-ruqaa-latin-400-normal.woff?url';
import arefRuqaaAr700 from '@fontsource/aref-ruqaa/files/aref-ruqaa-arabic-700-normal.woff?url';
import arefRuqaaLa700 from '@fontsource/aref-ruqaa/files/aref-ruqaa-latin-700-normal.woff?url';
import amiriAr400 from '@fontsource/amiri/files/amiri-arabic-400-normal.woff?url';
import amiriLa400 from '@fontsource/amiri/files/amiri-latin-400-normal.woff?url';
import amiriAr700 from '@fontsource/amiri/files/amiri-arabic-700-normal.woff?url';
import amiriLa700 from '@fontsource/amiri/files/amiri-latin-700-normal.woff?url';
import katibehAr from '@fontsource/katibeh/files/katibeh-arabic-400-normal.woff?url';
import katibehLa from '@fontsource/katibeh/files/katibeh-latin-400-normal.woff?url';
import rakkasAr from '@fontsource/rakkas/files/rakkas-arabic-400-normal.woff?url';
import rakkasLa from '@fontsource/rakkas/files/rakkas-latin-400-normal.woff?url';
import jomhuriaAr from '@fontsource/jomhuria/files/jomhuria-arabic-400-normal.woff?url';
import jomhuriaLa from '@fontsource/jomhuria/files/jomhuria-latin-400-normal.woff?url';
import scheherazadeAr400 from '@fontsource/scheherazade-new/files/scheherazade-new-arabic-400-normal.woff?url';
import scheherazadeLa400 from '@fontsource/scheherazade-new/files/scheherazade-new-latin-400-normal.woff?url';
import scheherazadeAr700 from '@fontsource/scheherazade-new/files/scheherazade-new-arabic-700-normal.woff?url';
import scheherazadeLa700 from '@fontsource/scheherazade-new/files/scheherazade-new-latin-700-normal.woff?url';
import harmattanAr400 from '@fontsource/harmattan/files/harmattan-arabic-400-normal.woff?url';
import harmattanLa400 from '@fontsource/harmattan/files/harmattan-latin-400-normal.woff?url';
import harmattanAr700 from '@fontsource/harmattan/files/harmattan-arabic-700-normal.woff?url';
import harmattanLa700 from '@fontsource/harmattan/files/harmattan-latin-700-normal.woff?url';
import tajawalAr400 from '@fontsource/tajawal/files/tajawal-arabic-400-normal.woff?url';
import tajawalLa400 from '@fontsource/tajawal/files/tajawal-latin-400-normal.woff?url';
import tajawalAr700 from '@fontsource/tajawal/files/tajawal-arabic-700-normal.woff?url';
import tajawalLa700 from '@fontsource/tajawal/files/tajawal-latin-700-normal.woff?url';
import almaraiAr400 from '@fontsource/almarai/files/almarai-arabic-400-normal.woff?url';
import almaraiLa400 from '@fontsource/almarai/files/almarai-latin-400-normal.woff?url';
import almaraiAr800 from '@fontsource/almarai/files/almarai-arabic-800-normal.woff?url';
import almaraiLa800 from '@fontsource/almarai/files/almarai-latin-800-normal.woff?url';
import plexAr400 from '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff?url';
import plexLa400 from '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-400-normal.woff?url';
import plexAr700 from '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-700-normal.woff?url';
import plexLa700 from '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-700-normal.woff?url';
import type { ShaperFontSource } from '@/lib/text-shaper';
import type { FontId } from './registry';

export interface CalligraphyFontDef {
  id: CalligraphyFontId;
  /** معرّف الخط في السجل العام (للعائلة والتسمية) */
  fontId: FontId;
  label: string;
  /** الأوزان المتاحة → ملفات (عربي + لاتيني) */
  weights: Record<number, ShaperFontSource>;
  /** سماكة قلم مقترحة بالنسبة إلى الحجم (مثلاً 0.012 = 1.2% من حجم الخط) */
  penWidth: number;
  /** أفضل استعمال */
  bestFor: string;
}

export const CALLIGRAPHY_FONT_IDS = [
  'aref-ruqaa',
  'amiri',
  'katibeh',
  'rakkas',
  'jomhuria',
  'scheherazade-new',
  'harmattan',
  'tajawal',
  'almarai',
  'ibm-plex-sans-arabic',
] as const;
export type CalligraphyFontId = (typeof CALLIGRAPHY_FONT_IDS)[number];

export const CALLIGRAPHY_FONTS: Record<CalligraphyFontId, CalligraphyFontDef> = {
  'aref-ruqaa': {
    id: 'aref-ruqaa',
    fontId: 'aref-ruqaa',
    label: 'عارف رقعة',
    weights: { 400: { arabic: arefRuqaaAr400, latin: arefRuqaaLa400 }, 700: { arabic: arefRuqaaAr700, latin: arefRuqaaLa700 } },
    penWidth: 0.012,
    bestFor: 'الأجمل لمؤثر الكتابة — بسملة، عنوان الجلسة، اقتباس قصير',
  },
  amiri: {
    id: 'amiri',
    fontId: 'amiri',
    label: 'أميري',
    weights: { 400: { arabic: amiriAr400, latin: amiriLa400 }, 700: { arabic: amiriAr700, latin: amiriLa700 } },
    penWidth: 0.01,
    bestFor: 'نسخ كلاسيكي بتشكيل دقيق — آيات وأبيات وعناوين أكاديمية',
  },
  katibeh: {
    id: 'katibeh',
    fontId: 'katibeh',
    label: 'كاتبة',
    weights: { 400: { arabic: katibehAr, latin: katibehLa } },
    penWidth: 0.012,
    bestFor: 'عنوان تراثي كبير بروح الثلث',
  },
  rakkas: {
    id: 'rakkas',
    fontId: 'rakkas',
    label: 'رقّاص',
    weights: { 400: { arabic: rakkasAr, latin: rakkasLa } },
    penWidth: 0.014,
    bestFor: 'كلمة أو كلمتان ثقيلتان — شعار جلسة',
  },
  jomhuria: {
    id: 'jomhuria',
    fontId: 'jomhuria',
    label: 'جمهورية',
    weights: { 400: { arabic: jomhuriaAr, latin: jomhuriaLa } },
    penWidth: 0.014,
    bestFor: 'عنوان ملصق مضغوط',
  },
  'scheherazade-new': {
    id: 'scheherazade-new',
    fontId: 'scheherazade-new',
    label: 'شهرزاد',
    weights: { 400: { arabic: scheherazadeAr400, latin: scheherazadeLa400 }, 700: { arabic: scheherazadeAr700, latin: scheherazadeLa700 } },
    penWidth: 0.01,
    bestFor: 'نسخ تقليدي — نصوص دينية وأدبية',
  },
  harmattan: {
    id: 'harmattan',
    fontId: 'harmattan',
    label: 'هرمتان',
    weights: { 400: { arabic: harmattanAr400, latin: harmattanLa400 }, 700: { arabic: harmattanAr700, latin: harmattanLa700 } },
    penWidth: 0.01,
    bestFor: 'أسلوب مغاربي (ورش) — لمسة محلية',
  },
  tajawal: {
    id: 'tajawal',
    fontId: 'tajawal',
    label: 'تجوال',
    weights: { 400: { arabic: tajawalAr400, latin: tajawalLa400 }, 700: { arabic: tajawalAr700, latin: tajawalLa700 } },
    penWidth: 0.012,
    bestFor: 'سانس حديث يُرسم خطوطه الخارجية — عناوين منتجات',
  },
  almarai: {
    id: 'almarai',
    fontId: 'almarai',
    label: 'المراعي',
    weights: { 400: { arabic: almaraiAr400, latin: almaraiLa400 }, 800: { arabic: almaraiAr800, latin: almaraiLa800 } },
    penWidth: 0.012,
    bestFor: 'سانس مؤسسي — كشف شعار/عنوان بخط خارجي ثم تعبئة',
  },
  'ibm-plex-sans-arabic': {
    id: 'ibm-plex-sans-arabic',
    fontId: 'ibm-plex-sans-arabic',
    label: 'IBM بلكس سانس عربي',
    weights: { 400: { arabic: plexAr400, latin: plexLa400 }, 700: { arabic: plexAr700, latin: plexLa700 } },
    penWidth: 0.012,
    bestFor: 'تقني — رسم خطوط العنوان كمخطط هندسي',
  },
};

export const CALLIGRAPHY_FONT_LIST: CalligraphyFontDef[] = Object.values(CALLIGRAPHY_FONTS);

/** يختار الملفات لوزن مطلوب (أقرب وزن متاح) */
export function calligraphySource(id: CalligraphyFontId, weight = 400): ShaperFontSource {
  const def = CALLIGRAPHY_FONTS[id];
  const available = Object.keys(def.weights).map(Number);
  const best = available.reduce((a, b) => (Math.abs(b - weight) < Math.abs(a - weight) ? b : a));
  return def.weights[best];
}
