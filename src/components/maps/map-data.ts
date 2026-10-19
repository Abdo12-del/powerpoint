import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { geoArea } from 'd3-geo';
import { feature as topojsonFeature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { resolveMediaUrl } from '@/lib/media-url';
import type { MapLabelLocale, MapVariant } from './types';

interface NamedCountry {
  ar: string;
  fr: string;
}

/** ISO-3166-1 numeric IDs for the 22 Arab League member states present in the 50m world atlas. */
export const ARAB_COUNTRY_NAMES: Readonly<Record<string, NamedCountry>> = {
  '012': { ar: 'الجزائر', fr: 'Algérie' },
  '048': { ar: 'البحرين', fr: 'Bahreïn' },
  '174': { ar: 'جزر القمر', fr: 'Comores' },
  '262': { ar: 'جيبوتي', fr: 'Djibouti' },
  '818': { ar: 'مصر', fr: 'Égypte' },
  '368': { ar: 'العراق', fr: 'Irak' },
  '400': { ar: 'الأردن', fr: 'Jordanie' },
  '414': { ar: 'الكويت', fr: 'Koweït' },
  '422': { ar: 'لبنان', fr: 'Liban' },
  '434': { ar: 'ليبيا', fr: 'Libye' },
  '478': { ar: 'موريتانيا', fr: 'Mauritanie' },
  '504': { ar: 'المغرب', fr: 'Maroc' },
  '512': { ar: 'عُمان', fr: 'Oman' },
  '275': { ar: 'فلسطين', fr: 'Palestine' },
  '634': { ar: 'قطر', fr: 'Qatar' },
  '682': { ar: 'السعودية', fr: 'Arabie saoudite' },
  '706': { ar: 'الصومال', fr: 'Somalie' },
  '729': { ar: 'السودان', fr: 'Soudan' },
  '760': { ar: 'سوريا', fr: 'Syrie' },
  '788': { ar: 'تونس', fr: 'Tunisie' },
  '784': { ar: 'الإمارات العربية المتحدة', fr: 'Émirats arabes unis' },
  '887': { ar: 'اليمن', fr: 'Yémen' },
};

export const ARAB_COUNTRY_CODES = Object.keys(ARAB_COUNTRY_NAMES);
const ARAB_COUNTRY_CODE_SET = new Set(ARAB_COUNTRY_CODES);

/**
 * Labels compiled from GeoAlgeria 2.3.0's MIT-licensed wilaya list. The associated
 * boundary polygons are a separate ODbL-licensed dataset; see public/maps/NOTICE.md.
 */
export const ALGERIA_WILAYA_NAMES: Readonly<Record<string, NamedCountry>> = {
  '01': { ar: 'أدرار', fr: 'Adrar' },
  '02': { ar: 'الشلف', fr: 'Chlef' },
  '03': { ar: 'الأغواط', fr: 'Laghouat' },
  '04': { ar: 'أم البواقي', fr: 'Oum El Bouaghi' },
  '05': { ar: 'باتنة', fr: 'Batna' },
  '06': { ar: 'بجاية', fr: 'Béjaïa' },
  '07': { ar: 'بسكرة', fr: 'Biskra' },
  '08': { ar: 'بشار', fr: 'Béchar' },
  '09': { ar: 'البليدة', fr: 'Blida' },
  '10': { ar: 'البويرة', fr: 'Bouira' },
  '11': { ar: 'تمنراست', fr: 'Tamanrasset' },
  '12': { ar: 'تبسة', fr: 'Tébessa' },
  '13': { ar: 'تلمسان', fr: 'Tlemcen' },
  '14': { ar: 'تيارت', fr: 'Tiaret' },
  '15': { ar: 'تيزي وزو', fr: 'Tizi Ouzou' },
  '16': { ar: 'الجزائر', fr: 'Alger' },
  '17': { ar: 'الجلفة', fr: 'Djelfa' },
  '18': { ar: 'جيجل', fr: 'Jijel' },
  '19': { ar: 'سطيف', fr: 'Sétif' },
  '20': { ar: 'سعيدة', fr: 'Saïda' },
  '21': { ar: 'سكيكدة', fr: 'Skikda' },
  '22': { ar: 'سيدي بلعباس', fr: 'Sidi Bel Abbès' },
  '23': { ar: 'عنابة', fr: 'Annaba' },
  '24': { ar: 'قالمة', fr: 'Guelma' },
  '25': { ar: 'قسنطينة', fr: 'Constantine' },
  '26': { ar: 'المدية', fr: 'Médéa' },
  '27': { ar: 'مستغانم', fr: 'Mostaganem' },
  '28': { ar: 'المسيلة', fr: "M'Sila" },
  '29': { ar: 'معسكر', fr: 'Mascara' },
  '30': { ar: 'ورقلة', fr: 'Ouargla' },
  '31': { ar: 'وهران', fr: 'Oran' },
  '32': { ar: 'البيض', fr: 'El Bayadh' },
  '33': { ar: 'إليزي', fr: 'Illizi' },
  '34': { ar: 'برج بوعريريج', fr: 'Bordj Bou Arreridj' },
  '35': { ar: 'بومرداس', fr: 'Boumerdès' },
  '36': { ar: 'الطارف', fr: 'El Tarf' },
  '37': { ar: 'تندوف', fr: 'Tindouf' },
  '38': { ar: 'تيسمسيلت', fr: 'Tissemsilt' },
  '39': { ar: 'الوادي', fr: 'El Oued' },
  '40': { ar: 'خنشلة', fr: 'Khenchela' },
  '41': { ar: 'سوق أهراس', fr: 'Souk Ahras' },
  '42': { ar: 'تيبازة', fr: 'Tipaza' },
  '43': { ar: 'ميلة', fr: 'Mila' },
  '44': { ar: 'عين الدفلى', fr: 'Aïn Defla' },
  '45': { ar: 'النعامة', fr: 'Naâma' },
  '46': { ar: 'عين تموشنت', fr: 'Aïn Témouchent' },
  '47': { ar: 'غرداية', fr: 'Ghardaïa' },
  '48': { ar: 'غليزان', fr: 'Relizane' },
  '49': { ar: 'تيميمون', fr: 'Timimoun' },
  '50': { ar: 'برج باجي مختار', fr: 'Bordj Badji Mokhtar' },
  '51': { ar: 'أولاد جلال', fr: 'Ouled Djellal' },
  '52': { ar: 'بني عباس', fr: 'Béni Abbès' },
  '53': { ar: 'عين صالح', fr: 'In Salah' },
  '54': { ar: 'عين قزام', fr: 'In Guezzam' },
  '55': { ar: 'توقرت', fr: 'Touggourt' },
  '56': { ar: 'جانت', fr: 'Djanet' },
  '57': { ar: 'المغير', fr: "El M'Ghair" },
  '58': { ar: 'المنيعة', fr: 'El Meniaa' },
  '59': { ar: 'آفلو', fr: 'Aflou' },
  '60': { ar: 'بريكة', fr: 'Barika' },
  '61': { ar: 'القنطرة', fr: 'El Kantara' },
  '62': { ar: 'بئر العاتر', fr: 'Bir El Ater' },
  '63': { ar: 'العريشة', fr: 'El Aricha' },
  '64': { ar: 'قصر الشلالة', fr: 'Ksar Chellala' },
  '65': { ar: 'عين وسارة', fr: 'Aïn Ouessara' },
  '66': { ar: 'مسعد', fr: 'Messaad' },
  '67': { ar: 'قصر البخاري', fr: 'Ksar El Boukhari' },
  '68': { ar: 'بوسعادة', fr: 'Bou Saâda' },
  '69': { ar: 'الأبيض سيدي الشيخ', fr: 'El Abiodh Sidi Cheikh' },
};

export function getRegionId(feature: Feature, variant: MapVariant): string {
  const properties = feature.properties as Record<string, unknown> | null;
  if (variant === 'algeria') {
    const code = Number(properties?.code);
    return Number.isInteger(code) && code >= 1 && code <= 69 ? String(code).padStart(2, '0') : '';
  }

  const rawId = feature.id;
  if (rawId === undefined || rawId === null || rawId === '') return '';
  const numericId = Number(rawId);
  return Number.isFinite(numericId) ? String(numericId).padStart(3, '0') : String(rawId);
}

export function getRegionLabel(feature: Feature, variant: MapVariant, locale: MapLabelLocale = 'ar'): string {
  const id = getRegionId(feature, variant);
  const properties = feature.properties as Record<string, unknown> | null;
  const names = variant === 'algeria' ? ALGERIA_WILAYA_NAMES[id] : ARAB_COUNTRY_NAMES[id];
  const fallback = String((properties?.name ?? id) || 'منطقة');

  if (!names) return fallback;
  if (locale === 'fr') return names.fr;
  if (locale === 'en') return String(properties?.name ?? names.fr);
  if (locale === 'dual') return `${names.ar} · ${names.fr}`;
  return names.ar;
}

export function getRegionValue(values: Readonly<Record<string, number>> | undefined, id: string): number | undefined {
  if (!values || !id) return undefined;
  const compactId = String(Number(id));
  const value = values[id] ?? values[compactId];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function getValueDomain(values: readonly (number | undefined)[]): [number, number] | undefined {
  const finite = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (finite.length === 0) return undefined;
  return [Math.min(...finite), Math.max(...finite)];
}

export function getChoroplethColor(value: number, domain: readonly [number, number], colors: readonly string[]): string {
  if (colors.length === 0) return '#1e293b';
  const [min, max] = domain;
  const progress = max === min ? 0.5 : Math.max(0, Math.min(1, (value - min) / (max - min)));
  const index = Math.min(colors.length - 1, Math.floor(progress * colors.length));
  return colors[index];
}

function reverseRing(ring: number[][]): number[][] {
  return [...ring].reverse();
}

/**
 * The display-grade OSM polygons use GeoJSON's usual outer-ring winding. d3-geo
 * interprets spherical exteriors in the opposite direction, so reverse only
 * features that d3-geo reads as their near-global complement.
 */
function orientForD3(feature: Feature<Geometry>): Feature<Geometry> {
  if (geoArea(feature) <= 2 * Math.PI) return feature;
  const geometry = feature.geometry;
  if (geometry.type === 'Polygon') {
    return { ...feature, geometry: { ...geometry, coordinates: geometry.coordinates.map(reverseRing) } };
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      ...feature,
      geometry: { ...geometry, coordinates: geometry.coordinates.map((polygon) => polygon.map(reverseRing)) },
    };
  }
  return feature;
}

const mapDataPromises = new Map<string, Promise<FeatureCollection>>();

function fetchMapCollection(url: string): Promise<FeatureCollection> {
  const cached = mapDataPromises.get(url);
  if (cached) return cached;

  const request = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`تعذّر تحميل بيانات الخريطة (${response.status})`);
      return response.json() as Promise<unknown>;
    })
    .then((data): FeatureCollection => {
      if (!data || typeof data !== 'object') throw new Error('بيانات الخريطة غير صالحة');
      const source = data as { type?: unknown; objects?: Record<string, unknown>; features?: unknown };
      if (source.type === 'Topology') {
        const topology = data as Topology;
        const countries = topology.objects.countries;
        if (!countries) throw new Error('طبقة الدول غير موجودة في ملف TopoJSON');
        const collection = topojsonFeature(topology, countries);
        if (collection.type !== 'FeatureCollection') throw new Error('طبقة الدول ليست مجموعة معالم');
        return collection as FeatureCollection;
      }
      if (source.type === 'FeatureCollection' && Array.isArray(source.features)) {
        return data as FeatureCollection;
      }
      throw new Error('صيغة بيانات الخريطة غير مدعومة');
    });

  mapDataPromises.set(url, request);
  request.catch(() => mapDataPromises.delete(url));
  return request;
}

export function normalizeAlgeriaBoundaryWinding(collection: FeatureCollection): FeatureCollection {
  return { ...collection, features: (collection.features as Feature<Geometry>[]).map(orientForD3) };
}

export async function loadMapGeographies(variant: MapVariant): Promise<FeatureCollection> {
  const source = variant === 'algeria' ? 'maps/algeria-wilayas-69.geojson' : 'maps/world-countries-50m.json';
  const url = resolveMediaUrl(source);
  if (!url) throw new Error('مسار بيانات الخريطة غير متاح');
  const collection = await fetchMapCollection(url);

  if (variant === 'arab-world') {
    const features = (collection.features as Feature<Geometry>[]).filter((item) => ARAB_COUNTRY_CODE_SET.has(getRegionId(item, 'world')));
    return { ...collection, features };
  }
  if (variant === 'algeria') return normalizeAlgeriaBoundaryWinding(collection);
  return collection;
}
