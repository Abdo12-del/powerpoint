import { useCallback, useEffect, useId } from 'react';
import { Coordinates, Mafs, MovablePoint, Plot, Text, useMovablePoint } from 'mafs';
import { CHART_COLORS } from '@/components/charts/theme';
import type { FunctionPlotProps, PlotDomain } from './types';
import 'mafs/core.css';
import 'mafs/font.css';

const DEFAULT_X_DOMAIN: PlotDomain = [-6, 6];
const DEFAULT_Y_DOMAIN: PlotDomain = [-1.6, 1.6];
const DEFAULT_FUNCTION = (x: number) => Math.sin(x);

function clamp(value: number, [min, max]: PlotDomain) {
  return Math.min(max, Math.max(min, value));
}

function safeValue(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function formatCoordinate(value: number) {
  const rounded = Number(value.toFixed(2));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

/** Mafs implementation with a draggable point that is constrained to the plotted function. */
export default function MafsFunctionPlot({
  fn = DEFAULT_FUNCTION,
  label = 'f(x) = sin(x)',
  xDomain = DEFAULT_X_DOMAIN,
  yDomain = DEFAULT_Y_DOMAIN,
  startAt = 1,
  height = 340,
  ariaLabel = 'رسم تفاعلي للدالة؛ اسحب النقطة أو استخدم منزلق قيمة x',
}: FunctionPlotProps) {
  const sliderId = useId();
  const instructionsId = useId();
  const pointX = clamp(startAt, xDomain);
  const evaluate = useCallback((x: number) => safeValue(fn(x)), [fn]);
  const constrainToGraph = useCallback(
    ([x]: [number, number]): [number, number] => {
      const constrainedX = clamp(x, xDomain);
      return [constrainedX, evaluate(constrainedX)];
    },
    [evaluate, xDomain],
  );
  const movable = useMovablePoint([pointX, evaluate(pointX)], {
    constrain: constrainToGraph,
    color: CHART_COLORS[0],
  });

  useEffect(() => {
    movable.setPoint([pointX, evaluate(pointX)]);
  }, [evaluate, movable.setPoint, pointX]);

  return (
    <div dir="rtl" role="group" aria-label={ariaLabel} className="space-y-4">
      <div className="math-mafs overflow-hidden rounded-xl border border-white/10" aria-describedby={instructionsId}>
        <Mafs
          width="auto"
          height={height}
          viewBox={{ x: xDomain, y: yDomain, padding: 0.35 }}
          pan={false}
          zoom={false}
        >
          <Coordinates.Cartesian subdivisions={1} />
          <Plot.OfX y={evaluate} domain={xDomain} color={CHART_COLORS[1]} weight={2.5} />
          <Text x={xDomain[0] + 0.25} y={yDomain[1] - 0.2} size={15} color="#e2e8f0" attach="nw">
            {label}
          </Text>
          <MovablePoint
            point={movable.point}
            onMove={movable.setPoint}
            constrain={constrainToGraph}
            color={CHART_COLORS[0]}
          />
        </Mafs>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/55 px-4 py-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={sliderId} className="text-sm font-semibold text-slate-200">
            حرّك النقطة على المنحنى
          </label>
          <output
            htmlFor={sliderId}
            dir="ltr"
            aria-live="polite"
            className="font-mono text-sm text-amber-200"
          >
            x = {formatCoordinate(movable.x)}, y = {formatCoordinate(movable.y)}
          </output>
        </div>
        <input
          id={sliderId}
          dir="ltr"
          type="range"
          min={xDomain[0]}
          max={xDomain[1]}
          step={Math.max((xDomain[1] - xDomain[0]) / 200, 0.001)}
          value={movable.x}
          onChange={(event) => movable.setPoint(constrainToGraph([Number(event.currentTarget.value), 0]))}
          aria-describedby={instructionsId}
          className="w-full cursor-ew-resize accent-amber-300"
        />
        <p id={instructionsId} className="mt-1 text-xs leading-6 text-slate-400">
          اسحب النقطة داخل الرسم أو استخدم منزلق x بلوحة المفاتيح؛ تتبع النقطة قيمة الدالة مباشرة.
        </p>
      </div>
    </div>
  );
}
