/**
 * كتالوج المعدات العلمية — أصول PNG أصلية شفافة (رسمت لهذا المستودع).
 * المصادر SVG في assets/svg/ والنواتج PNG في assets/png/،
 * وتولَّد عبر scripts/generate-equipment-assets.mjs. لا روابط خارجية.
 */
import type { EquipmentAsset } from './types';
import erlenmeyerFlask from './assets/png/erlenmeyer-flask.png';
import graduatedCylinder from './assets/png/graduated-cylinder.png';
import beaker from './assets/png/beaker.png';
import testTube from './assets/png/test-tube.png';
import testTubeRack from './assets/png/test-tube-rack.png';
import dropperPipette from './assets/png/dropper-pipette.png';
import petriDish from './assets/png/petri-dish.png';
import microscope from './assets/png/microscope.png';
import safetyGoggles from './assets/png/safety-goggles.png';
import spiritLamp from './assets/png/spirit-lamp.png';

/** كل الأصول مربعة 512×512 بخلفية شفافة */
export const EQUIPMENT: EquipmentAsset[] = [
  {
    id: 'erlenmeyer-flask',
    name: 'دورق مخروطي',
    category: 'glassware',
    keywords: ['قارورة', 'قنينة', 'دورق', 'مخروطي', 'flask', 'erlenmeyer'],
    src: erlenmeyerFlask,
    width: 512,
    height: 512,
  },
  {
    id: 'graduated-cylinder',
    name: 'مخبار مدرّج',
    category: 'glassware',
    keywords: ['مخبار', 'أسطوانة', 'قياس', 'حجم', 'cylinder', 'graduated'],
    src: graduatedCylinder,
    width: 512,
    height: 512,
  },
  {
    id: 'beaker',
    name: 'كأس زجاجي',
    category: 'glassware',
    keywords: ['كأس', 'كوب', 'بيكر', 'زجاج', 'beaker'],
    src: beaker,
    width: 512,
    height: 512,
  },
  {
    id: 'test-tube',
    name: 'أنبوب اختبار',
    category: 'glassware',
    keywords: ['أنبوب', 'انبوب', 'اختبار', 'tube', 'test'],
    src: testTube,
    width: 512,
    height: 512,
  },
  {
    id: 'test-tube-rack',
    name: 'حامل أنابيب الاختبار',
    category: 'glassware',
    keywords: ['حامل', 'رف', 'أنابيب', 'انابيب', 'rack', 'test', 'tube'],
    src: testTubeRack,
    width: 512,
    height: 512,
  },
  {
    id: 'dropper-pipette',
    name: 'ماصة قطارة',
    category: 'tools',
    keywords: ['ماصة', 'قطارة', 'قطّارة', 'تقطير', 'pipette', 'dropper'],
    src: dropperPipette,
    width: 512,
    height: 512,
  },
  {
    id: 'petri-dish',
    name: 'طبق بتري',
    category: 'tools',
    keywords: ['طبق', 'بتري', 'زراعة', 'أحياء', 'petri', 'dish'],
    src: petriDish,
    width: 512,
    height: 512,
  },
  {
    id: 'microscope',
    name: 'مجهر',
    category: 'devices',
    keywords: ['ميكروسكوب', 'مجهر', 'فحص', 'microscope'],
    src: microscope,
    width: 512,
    height: 512,
  },
  {
    id: 'safety-goggles',
    name: 'نظارات واقية',
    category: 'safety',
    keywords: ['نظارات', 'وقاية', 'سلامة', 'حماية', 'goggles', 'safety'],
    src: safetyGoggles,
    width: 512,
    height: 512,
  },
  {
    id: 'spirit-lamp',
    name: 'مصباح كحولي',
    category: 'heating',
    keywords: ['مصباح', 'موقد', 'لهب', 'تسخين', 'كحول', 'lamp', 'burner', 'spirit'],
    src: spiritLamp,
    width: 512,
    height: 512,
  },
];

/** بحث سريع بالمعرف */
export function assetById(id: string): EquipmentAsset | undefined {
  return EQUIPMENT.find((asset) => asset.id === id);
}

/** توحيد بسيط للاستعلام العربي/اللاتيني: همزات الألف، التاء المربوطة، التشكيل، حالة الأحرف */
export function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '') // تشكيل + تطويل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();
}

/** هل يطابق الأصلُ استعلامَ البحث؟ (الاسم أو الكلمات المفتاحية) */
export function matchesQuery(asset: EquipmentAsset, query: string): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;
  const haystack = [asset.name, ...asset.keywords, asset.id].map(normalizeQuery);
  return haystack.some((text) => text.includes(q));
}
