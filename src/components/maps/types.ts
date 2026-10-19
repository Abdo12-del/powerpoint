import type { Feature } from 'geojson';

export type MapVariant = 'world' | 'arab-world' | 'algeria';
export type MapMode = 'location' | 'choropleth';
export type MapLabelLocale = 'ar' | 'fr' | 'en' | 'dual';

export interface MapMarker {
  /** Stable key, also used to stagger pulse timing. */
  id: string;
  /** Geographic coordinates in [longitude, latitude] order. */
  coordinates: [number, number];
  label: string;
  detail?: string;
  color?: string;
  /** Defaults to true; pulsing still respects prefers-reduced-motion. */
  pulse?: boolean;
}

export interface MapRegion {
  /** Numeric ISO-3166-1 country code (3 digits) or Wilaya code (2 digits). */
  id: string;
  label: string;
  value?: number;
  feature: Feature;
}

export interface MapChartProps {
  variant: MapVariant;
  mode?: MapMode;
  /** Values keyed by padded country ID (e.g. "012") or Wilaya code (e.g. "16"). */
  values?: Readonly<Record<string, number>>;
  markers?: readonly MapMarker[];
  selectedIds?: readonly string[];
  colorScale?: readonly string[];
  labelLocale?: MapLabelLocale;
  legendLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showMarkerLabels?: boolean;
  showRegionLabels?: boolean;
  ariaLabel?: string;
  className?: string;
  onRegionClick?: (region: MapRegion) => void;
  onMarkerClick?: (marker: MapMarker) => void;
}
