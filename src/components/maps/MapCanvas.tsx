import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { geoCentroid } from 'd3-geo';
import { motion } from 'framer-motion';
import { ComposableMap, Geography, Geographies, Graticule, Marker, Sphere } from 'react-simple-maps';
import { CHART_COLORS, CHART_SEMANTIC, CHART_SEQUENTIAL, formatNumber } from '@/components/charts/theme';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import {
  getChoroplethColor,
  getRegionId,
  getRegionLabel,
  getRegionValue,
  getValueDomain,
  loadMapGeographies,
} from './map-data';
import type { MapChartProps, MapRegion, MapVariant } from './types';

const VIEW = { width: 800, height: 460 } as const;
const PROJECTIONS: Record<MapVariant, { projection: 'geoEqualEarth' | 'geoMercator'; center: [number, number]; scale: number }> = {
  world: { projection: 'geoEqualEarth', center: [0, 0], scale: 145 },
  'arab-world': { projection: 'geoMercator', center: [30, 22], scale: 400 },
  algeria: { projection: 'geoMercator', center: [1.5, 28], scale: 1040 },
};

function selected(selectedIds: readonly string[] | undefined, id: string): boolean {
  if (!selectedIds?.length) return false;
  return selectedIds.some((value) => value === id || String(Number(value)).padStart(id.length, '0') === id);
}

function MapMarkerGlyph({
  marker,
  index,
  showLabel,
  onMarkerClick,
}: {
  marker: NonNullable<MapChartProps['markers']>[number];
  index: number;
  showLabel: boolean;
  onMarkerClick?: MapChartProps['onMarkerClick'];
}) {
  const reducedMotion = prefersReducedMotion();
  const color = marker.color ?? CHART_COLORS[index % CHART_COLORS.length];
  const animatePulse = marker.pulse !== false && !reducedMotion;
  const activate = () => onMarkerClick?.(marker);

  return (
    <Marker coordinates={marker.coordinates}>
      <g
        role={onMarkerClick ? 'button' : 'img'}
        tabIndex={onMarkerClick ? 0 : undefined}
        aria-label={marker.detail ? `${marker.label} — ${marker.detail}` : marker.label}
        className={onMarkerClick ? 'cursor-pointer' : undefined}
        onClick={onMarkerClick ? activate : undefined}
        onKeyDown={
          onMarkerClick
            ? (event: KeyboardEvent<SVGGElement>) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  activate();
                }
              }
            : undefined
        }
      >
        <title>{marker.detail ? `${marker.label} — ${marker.detail}` : marker.label}</title>
        <motion.circle
          cx={0}
          cy={0}
          fill={color}
          initial={false}
          animate={animatePulse ? { r: [5, 14], opacity: [0.5, 0] } : { r: 5, opacity: 0 }}
          transition={
            animatePulse
              ? { duration: 2, repeat: Infinity, ease: 'easeOut', delay: (index % 5) * 0.24 }
              : { duration: 0 }
          }
          aria-hidden="true"
        />
        <circle cx={0} cy={0} r={4.25} fill={color} stroke="#0f172a" strokeWidth={1.75} aria-hidden="true" />
        {showLabel && (
          <text
            x={0}
            y={-10}
            textAnchor="middle"
            direction="rtl"
            fontSize={12}
            fontWeight={700}
            fill={CHART_SEMANTIC.textStrong}
            stroke="#020617"
            strokeWidth={3}
            paintOrder="stroke"
            aria-hidden="true"
          >
            {marker.label}
          </text>
        )}
      </g>
    </Marker>
  );
}

function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="flex aspect-[16/9] w-full items-center justify-center rounded-xl border border-white/10 bg-slate-900/60">
      <span className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-400">جارٍ تحميل بيانات الخريطة…</span>
    </div>
  );
}

export default function MapCanvas({
  variant,
  mode = 'location',
  values,
  markers = [],
  selectedIds,
  colorScale = CHART_SEQUENTIAL,
  labelLocale = 'ar',
  legendLabel,
  showLegend,
  showGrid,
  showMarkerLabels = true,
  showRegionLabels = false,
  ariaLabel,
  onRegionClick,
  onMarkerClick,
}: MapChartProps) {
  const [geography, setGeography] = useState<Awaited<ReturnType<typeof loadMapGeographies>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setGeography(null);
    setError(null);
    loadMapGeographies(variant)
      .then((collection) => {
        if (active) setGeography(collection);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'تعذّر تحميل بيانات الخريطة');
      });
    return () => {
      active = false;
    };
  }, [variant, retry]);

  const palette = colorScale.length ? colorScale : CHART_SEQUENTIAL;
  const config = PROJECTIONS[variant];
  const showLegendNow = showLegend ?? mode === 'choropleth';
  const showGridNow = showGrid ?? variant !== 'algeria';
  const countryTitle =
    ariaLabel ??
    (variant === 'world' ? 'خريطة العالم' : variant === 'arab-world' ? 'خريطة العالم العربي' : 'خريطة ولايات الجزائر');
  const domain = useMemo(() => {
    if (!geography) return undefined;
    return getValueDomain(geography.features.map((item) => getRegionValue(values, getRegionId(item, variant))));
  }, [geography, values, variant]);

  if (error) {
    return (
      <div role="alert" className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 rounded-xl border border-rose-300/15 bg-rose-400/[0.04] px-5 text-center">
        <p className="text-sm text-rose-200">{error}</p>
        <button
          type="button"
          onClick={() => setRetry((value) => value + 1)}
          className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-slate-200 transition hover:bg-white/10"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }
  if (!geography) return <LoadingState />;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/60" style={{ aspectRatio: `${VIEW.width} / ${VIEW.height}` }}>
        <ComposableMap
          width={VIEW.width}
          height={VIEW.height}
          projection={config.projection}
          projectionConfig={{ center: config.center, scale: config.scale }}
          role="group"
          aria-label={countryTitle}
          className="h-full w-full"
        >
          {variant === 'world' && <Sphere fill="#0b1324" stroke={CHART_SEMANTIC.axis} strokeWidth={0.5} />}
          {showGridNow && <Graticule stroke={CHART_SEMANTIC.grid} strokeWidth={0.45} step={[20, 20]} />}
          <Geographies geography={geography}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => {
                  const id = getRegionId(geo, variant);
                  const label = getRegionLabel(geo, variant, labelLocale);
                  const value = getRegionValue(values, id);
                  const isSelected = selected(selectedIds, id);
                  const fill = isSelected
                    ? CHART_SEMANTIC.highlight
                    : mode === 'choropleth'
                      ? value === undefined || !domain
                        ? CHART_SEMANTIC.muted
                        : getChoroplethColor(value, domain, palette)
                      : CHART_SEQUENTIAL[0];
                  const valueText = value === undefined ? '' : ` · ${formatNumber(value)}`;
                  const accessibleName = `${label}${valueText}`;
                  const region: MapRegion = { id, label, value, feature: geo };

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={variant === 'algeria' ? 'rgba(226, 232, 240, 0.46)' : 'rgba(226, 232, 240, 0.27)'}
                      strokeWidth={variant === 'algeria' ? 0.55 : 0.65}
                      className="transition-[fill,filter] duration-200 hover:brightness-125 focus-visible:brightness-125 focus-visible:stroke-amber-300"
                      role={onRegionClick ? 'button' : 'img'}
                      tabIndex={onRegionClick ? 0 : undefined}
                      aria-label={accessibleName}
                      onClick={onRegionClick ? () => onRegionClick(region) : undefined}
                      onKeyDown={
                        onRegionClick
                          ? (event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onRegionClick(region);
                              }
                            }
                          : undefined
                      }
                    >
                      <title>{accessibleName}</title>
                    </Geography>
                  );
                })}
                {showRegionLabels &&
                  geographies.map((geo) => {
                    const coordinates = geoCentroid(geo);
                    if (!coordinates.every(Number.isFinite)) return null;
                    return (
                      <Marker key={`label-${geo.rsmKey}`} coordinates={coordinates}>
                        <text
                          textAnchor="middle"
                          direction="rtl"
                          fontSize={variant === 'algeria' ? 7 : variant === 'arab-world' ? 9 : 8}
                          fontWeight={700}
                          fill={CHART_SEMANTIC.textStrong}
                          stroke="#020617"
                          strokeWidth={2.5}
                          paintOrder="stroke"
                          pointerEvents="none"
                        >
                          {getRegionLabel(geo, variant, labelLocale)}
                        </text>
                      </Marker>
                    );
                  })}
              </>
            )}
          </Geographies>
          {markers.map((marker, index) => (
            <MapMarkerGlyph
              key={marker.id}
              marker={marker}
              index={index}
              showLabel={showMarkerLabels}
              onMarkerClick={onMarkerClick}
            />
          ))}
        </ComposableMap>
      </div>

      {mode === 'choropleth' && showLegendNow &&
        (domain ? (
          <div className="flex flex-col gap-1.5 text-xs text-slate-400">
            {legendLabel && <div className="font-semibold text-slate-300">{legendLabel}</div>}
            <div dir="ltr" className="flex items-center gap-3">
              <span className="min-w-10 text-left tabular-nums">{formatNumber(domain[0])}</span>
              <div
                className="h-2 min-w-0 flex-1 rounded-full"
                style={{ backgroundImage: `linear-gradient(90deg, ${palette.join(', ')})` }}
                role="img"
                aria-label={`مقياس ألوان من ${formatNumber(domain[0])} إلى ${formatNumber(domain[1])}`}
              />
              <span className="min-w-10 text-right tabular-nums">{formatNumber(domain[1])}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">أضف قيماً رقمية لعرض مفتاح التدرّج.</p>
        ))}
    </div>
  );
}
