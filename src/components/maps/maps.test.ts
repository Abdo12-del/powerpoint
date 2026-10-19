import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { geoArea } from 'd3-geo';
import { feature as topojsonFeature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import type { Topology } from 'topojson-specification';
import {
  ALGERIA_WILAYA_NAMES,
  ARAB_COUNTRY_CODES,
  ARAB_COUNTRY_NAMES,
  getChoroplethColor,
  getRegionId,
  getRegionLabel,
  getRegionValue,
  getValueDomain,
  normalizeAlgeriaBoundaryWinding,
} from './map-data';

const readMap = <T,>(path: string) => JSON.parse(readFileSync(new URL(`../../../public/maps/${path}`, import.meta.url), 'utf8')) as T;

describe('geographic datasets and map utilities', () => {
  it('ships current 69-wilaya Algeria boundaries with stable 01–69 join codes', () => {
    const source = readMap<FeatureCollection>('algeria-wilayas-69.geojson');
    const codes = source.features.map((item) => String(item.properties?.code).padStart(2, '0')).sort();
    expect(source.features).toHaveLength(69);
    expect(codes).toEqual(Array.from({ length: 69 }, (_, index) => String(index + 1).padStart(2, '0')));
    expect(ALGERIA_WILAYA_NAMES['16']).toEqual({ ar: 'الجزائر', fr: 'Alger' });
    expect(ALGERIA_WILAYA_NAMES['69']?.ar).toBe('الأبيض سيدي الشيخ');
  });

  it('rewinds ODbL wilaya polygons into the smaller spherical outlines d3-geo expects', () => {
    const raw = readMap<FeatureCollection>('algeria-wilayas-69.geojson');
    expect(geoArea(raw.features[0])).toBeGreaterThan(2 * Math.PI);
    const normalized = normalizeAlgeriaBoundaryWinding(raw);
    expect(normalized.features).toHaveLength(69);
    for (const item of normalized.features) expect(geoArea(item)).toBeLessThan(2 * Math.PI);
  });

  it('converts the Natural Earth TopoJSON and includes all 22 Arab League states, including small islands', () => {
    const topology = readMap<Topology>('world-countries-50m.json');
    const countries = topojsonFeature(topology, topology.objects.countries) as FeatureCollection;
    const codes = countries.features.map((item) => String(item.id).padStart(3, '0'));
    const arabCodes = codes.filter((code) => ARAB_COUNTRY_CODES.includes(code));
    expect(countries.features.length).toBeGreaterThan(170);
    expect(ARAB_COUNTRY_CODES).toHaveLength(22);
    expect(arabCodes).toHaveLength(22);
    expect(arabCodes).toContain('048'); // Bahrain
    expect(arabCodes).toContain('174'); // Comoros
    expect(ARAB_COUNTRY_NAMES['275']?.ar).toBe('فلسطين');
  });

  it('builds padded regional IDs and Arabic/French labels', () => {
    const algeria = readMap<FeatureCollection>('algeria-wilayas-69.geojson').features[15];
    const world = topojsonFeature(
      readMap<Topology>('world-countries-50m.json'),
      readMap<Topology>('world-countries-50m.json').objects.countries,
    ) as FeatureCollection;
    const algeriaFeature = algeria!;
    const algeriaId = getRegionId(algeriaFeature, 'algeria');
    const algeriaNames = getRegionLabel(algeriaFeature, 'algeria', 'dual');
    const algeriaWorld = world.features.find((item) => getRegionId(item, 'world') === '012')!;
    expect(algeriaId).toBe('16');
    expect(algeriaNames).toBe('الجزائر · Alger');
    expect(getRegionLabel(algeriaWorld, 'world', 'ar')).toBe('الجزائر');
  });

  it('looks up padded or unpadded IDs without confusing zero with missing data', () => {
    expect(getRegionValue({ '012': 4, '16': 0 }, '012')).toBe(4);
    expect(getRegionValue({ '1': 0 }, '01')).toBe(0);
    expect(getRegionValue({ '1': Number.NaN }, '01')).toBeUndefined();
    expect(getRegionValue(undefined, '01')).toBeUndefined();
  });

  it('creates a finite domain and assigns palette endpoints and midpoints', () => {
    expect(getValueDomain([3, undefined, Number.NaN, -2, 5])).toEqual([-2, 5]);
    expect(getValueDomain([undefined, Number.NaN])).toBeUndefined();
    const colors = ['slate', 'amber-dark', 'amber', 'gold'];
    expect(getChoroplethColor(-2, [-2, 5], colors)).toBe('slate');
    expect(getChoroplethColor(1.5, [-2, 5], colors)).toBe('amber');
    expect(getChoroplethColor(50, [-2, 5], colors)).toBe('gold');
    expect(getChoroplethColor(12, [12, 12], colors)).toBe('amber');
    expect(getChoroplethColor(1, [0, 1], [])).toBe('#1e293b');
  });
});
