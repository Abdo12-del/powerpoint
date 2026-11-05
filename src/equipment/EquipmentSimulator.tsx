/**
 * بطاقة الإجراء المخبري المصغّرة — تُفتح فوق الشريحة المفتوحة نفسها،
 * بلا صفحة مستقلة وبلا مسار جديد. كل إجراء يقرأ مدخلات المتعلّم
 * ويحسب النتيجة عبر دوال `simulation.ts` النقية، ويرسم مشهداً صغيراً
 * يستجيب للحظتها. الحالة مؤقتة (لا تلمس localStorage).
 */
import { useMemo, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import {
  PROCEDURES,
  bloodPressureReadout,
  centrifugeState,
  compassReadout,
  flameState,
  focusBlur,
  focusClarity,
  signalReadout,
  stirState,
  titrationReadout,
} from './simulation';
import type { EquipmentAsset } from './types';
import { cn } from '@/lib/cn';

export interface EquipmentSimulatorProps {
  asset: EquipmentAsset;
  onClose: () => void;
}

interface SimState {
  volume: number;
  air: number;
  rpm: number;
  freq: number;
  amp: number;
  focus: number;
  spinRpm: number;
  seconds: number;
  strike: number;
  dip: number;
  pressure: number;
}

const INITIAL: SimState = {
  volume: 0,
  air: 10,
  rpm: 0,
  freq: 100,
  amp: 2,
  focus: 50,
  spinRpm: 0,
  seconds: 0,
  strike: 0,
  dip: 0,
  pressure: 180,
};

/** شريط تحكم بسيط بنمط اللوحة */
function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  testid,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  testid: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-300">
        <span>{label}</span>
        <span className="tabular-nums text-amber-200">
          {value} {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        data-testid={testid}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-amber-400"
      />
    </label>
  );
}

/** شريحة قراءة رقمية */
function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] text-slate-300">
      <span>{label}</span>
      <b className="tabular-nums text-amber-100">{value}</b>
    </span>
  );
}

/** مشهد المعايرة: سحاحة + كأس يتغيّر لونه */
function TitrationStage({ volume, color }: { volume: number; color: string }) {
  const drops = volume > 0 ? 3 : 0;
  return (
    <svg viewBox="0 0 240 116" className="h-28 w-full" aria-hidden>
      <rect x="52" y="6" width="16" height="52" rx="4" fill="#e0f2fe" stroke="#1e293b" strokeWidth="2.5" />
      <rect x="55" y="14" width="10" height="36" fill="#7dd3fc" />
      <rect x="44" y="58" width="32" height="6" rx="3" fill="#94a3b8" />
      <path d="M58 64 L62 74 L54 74 Z" fill="#bae6fd" stroke="#1e293b" strokeWidth="2" />
      {Array.from({ length: drops }).map((_, i) => (
        <circle key={i} cx={58} cy={82 + i * 7} r="2.6" fill="#38bdf8" />
      ))}
      <path d="M34 96 L86 96 L80 86 L40 86 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" />
      <path fill="#f8fafc" d="M46 74 L74 74 L78 88 L42 88 Z" opacity="0.75" />
      <path fill={color} d="M48 82 L72 82 L76 88 L44 88 Z" />
      <path d="M130 18 L238 18" stroke="#334155" strokeWidth="2" strokeDasharray="5 4" opacity="0.5" />
      <text x="132" y="46" fontSize="13" fill="#e2e8f0" fontFamily="monospace">
        {volume.toFixed(1)} mL
      </text>
      <text x="132" y="70" fontSize="10" fill="#94a3b8">
        NaOH 0.1 M
      </text>
      <circle cx="222" cy="86" r="16" fill={color} stroke="#1e293b" strokeWidth="2" />
      <text x="222" y="112" fontSize="9" fill="#94a3b8" textAnchor="middle">
        الفينولفثالين
      </text>
    </svg>
  );
}

/** مشهد اللهب */
function FlameStage({ air }: { air: number }) {
  const flame = flameState(air);
  return (
    <svg viewBox="0 0 240 116" className="h-28 w-full" aria-hidden>
      <path
        fill={flame.color}
        d="M120 16 Q140 44 136 62 Q132 78 120 80 Q108 78 104 62 Q100 44 120 16 Z"
        opacity="0.95"
      />
      <path fill={flame.core} d="M120 42 Q128 56 126 66 Q124 76 120 76 Q116 76 114 66 Q112 56 120 42 Z" />
      <rect x="112" y="80" width="16" height="20" rx="3" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" />
      <rect x="98" y="94" width="44" height="6" rx="3" fill="#475569" />
      <path d="M60 108 L180 108 L170 100 L70 100 Z" fill="#334155" stroke="#1e293b" strokeWidth="2" />
      <text x="196" y="52" fontSize="12" fill="#fcd34d" fontFamily="monospace">
        {flame.temperatureC}°C
      </text>
      {flame.sooty && <text x="196" y="72" fontSize="9" fill="#fb923c">مدخّن</text>}
    </svg>
  );
}

/** مشهد المقلب: دوّامة تزداد مع السرعة */
function StirStage({ rpm }: { rpm: number }) {
  const stir = stirState(rpm);
  const depth = 4 + stir.vortex * 14;
  return (
    <svg viewBox="0 0 240 116" className="h-28 w-full" aria-hidden>
      <path fill="#e0f2fe" d="M82 24 L158 24 L158 78 L82 78 Z" opacity="0.85" />
      <path fill="#a7f3d0" d="M84 44 L156 44 L156 78 L84 78 Z" />
      <ellipse cx="120" cy={44} rx={36 - stir.vortex * 6} ry={depth / 2} fill="#6ee7b7" opacity="0.9" />
      <ellipse
        cx="120"
        cy="44"
        rx={20 + stir.vortex * 10}
        ry={3 + stir.vortex * 3}
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        className={rpm > 0 ? 'animate-pulse' : undefined}
      />
      <rect x="104" y="66" width="32" height="6" rx="3" fill="#475569" />
      <rect x="66" y="82" width="108" height="16" rx="6" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" />
      <circle cx="158" cy="90" r="5" fill="#475569" />
      <path d="M82 24 L82 78 M158 24 L158 78 M82 78 L158 78" stroke="#1e293b" strokeWidth="2.5" fill="none" />
      <text x="196" y="52" fontSize="12" fill="#fcd34d" fontFamily="monospace">
        {stir.rpm}
      </text>
      <text x="196" y="66" fontSize="9" fill="#94a3b8">rpm</text>
    </svg>
  );
}

/** شاشة راسم الاهتزاز */
function WaveStage({ freq, amp }: { freq: number; amp: number }) {
  const signal = signalReadout({ freqHz: freq, ampV: amp });
  return (
    <svg viewBox="0 0 240 116" className="h-28 w-full" aria-hidden>
      <rect x="6" y="8" width="228" height="100" rx="8" fill="#052e2b" stroke="#1e293b" strokeWidth="2" />
      <path d="M16 58 L224 58 M120 16 L120 100" stroke="#22c55e" strokeWidth="1" opacity="0.35" />
      <g transform="translate(0 8)">
        <path d={signal.path} fill="none" stroke="#4ade80" strokeWidth="2.2" />
      </g>
      <text x="16" y="24" fontSize="9" fill="#86efac" fontFamily="monospace">
        5 V/div · 5 ms/div
      </text>
    </svg>
  );
}

/** مشهد المجهر: خلايا تضبب خارج البؤرة */
function FocusStage({ focus }: { focus: number }) {
  const blur = focusBlur(focus);
  return (
    <svg viewBox="0 0 240 116" className="h-28 w-full" aria-hidden>
      <circle cx="120" cy="58" r="46" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
      <g style={{ filter: `blur(${blur}px)` }}>
        <circle cx="120" cy="58" r="40" fill="#ecfccb" />
        <circle cx="104" cy="46" r="10" fill="#a3e635" stroke="#4d7c0f" strokeWidth="2" />
        <circle cx="136" cy="54" r="8" fill="#bef264" stroke="#4d7c0f" strokeWidth="2" />
        <circle cx="112" cy="72" r="9" fill="#d9f99d" stroke="#4d7c0f" strokeWidth="2" />
        <circle cx="140" cy="76" r="6" fill="#a3e635" stroke="#4d7c0f" strokeWidth="2" />
        <ellipse cx="122" cy="58" rx="3" ry="19" fill="#65a30d" opacity="0.5" />
      </g>
      <path d="M120 12 L120 20 M120 96 L120 104 M74 58 L82 58 M158 58 L166 58" stroke="#94a3b8" strokeWidth="2" />
    </svg>
  );
}

/** مشهد الطرد المركزي */
function CentrifugeStage({ rpm, seconds }: { rpm: number; seconds: number }) {
  const state = centrifugeState(rpm, seconds);
  const pellet = (state.separation / 100) * 26;
  return (
    <svg viewBox="0 0 240 116" className="h-28 w-full" aria-hidden>
      <rect x="52" y="14" width="136" height="92" rx="10" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="120" cy="58" r="36" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
      <g className={rpm > 0 ? 'animate-spin' : undefined} style={{ transformOrigin: '120px 58px' }}>
        <rect x="112" y="26" width="16" height="30" rx="4" fill="#bae6fd" stroke="#475569" strokeWidth="2" />
        <rect x="112" y="60" width="16" height="30" rx="4" fill="#bae6fd" stroke="#475569" strokeWidth="2" />
        <circle cx="120" cy="58" r="6" fill="#64748b" />
      </g>
      <rect x="114" y={84 - pellet} width="12" height={pellet} rx="2" fill="#f87171" opacity="0.9" />
      <text x="196" y="46" fontSize="12" fill="#fcd34d" fontFamily="monospace">
        {state.rcf}×g
      </text>
      <text x="196" y="62" fontSize="9" fill="#94a3b8">{state.separation}%</text>
      <text x="196" y="76" fontSize="9" fill="#94a3b8">{state.label}</text>
    </svg>
  );
}

/** مشهد البوصلة الجيولوجية */
function CompassStage({ strike, dip }: { strike: number; dip: number }) {
  const read = compassReadout(strike, dip);
  return (
    <svg viewBox="0 0 240 116" className="h-28 w-full" aria-hidden>
      <circle cx="94" cy="58" r="42" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="94" cy="58" r="32" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <g transform={`rotate(${read.strike} 94 58)`}>
        <path d="M94 26 L100 58 L94 68 L88 58 Z" fill="#dc2626" />
      </g>
      <circle cx="94" cy="58" r="4" fill="#334155" />
      <text x="150" y="46" fontSize="11" fill="#e2e8f0" fontFamily="monospace">
        {read.strike}°
      </text>
      <text x="150" y="62" fontSize="10" fill="#94a3b8">dip {read.dip}°</text>
      <path
        d={`M${176} 96 L${176 + Math.cos((read.dip * Math.PI) / 180) * 46} ${96 - Math.sin((read.dip * Math.PI) / 180) * 40}`}
        stroke="#fbbf24"
        strokeWidth="3"
      />
      <path d="M150 96 L232 96" stroke="#475569" strokeWidth="2" />
    </svg>
  );
}

/** مشهد ضغط الدم */
function BloodPressureStage({ pressure }: { pressure: number }) {
  const read = bloodPressureReadout(pressure);
  const angle = -120 + (read.pressure / 200) * 240;
  return (
    <svg viewBox="0 0 240 116" className="h-28 w-full" aria-hidden>
      <circle cx="96" cy="58" r="42" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
      <path d="M60 58 A 36 36 0 0 1 132 58" fill="none" stroke="#e2e8f0" strokeWidth="6" />
      <g transform={`rotate(${angle} 96 58)`}>
        <path d="M96 58 L96 26" stroke="#dc2626" strokeWidth="3" />
      </g>
      <circle cx="96" cy="58" r="4" fill="#334155" />
      <text x="150" y="48" fontSize="12" fill="#fca5a5" fontFamily="monospace">
        {read.reading}
      </text>
      <text x="150" y="66" fontSize="10" fill="#94a3b8">
        {read.pulseHeard ? 'صوت ♥' : '—'}
      </text>
      <rect x="150" y="78" width="76" height="16" rx="8" fill="#1e293b" />
      <text x="158" y="90" fontSize="9" fill="#cbd5e1">
        {read.pressure} mmHg
      </text>
    </svg>
  );
}

export function EquipmentSimulator({ asset, onClose }: EquipmentSimulatorProps) {
  const procedure = PROCEDURES[asset.id];
  const [state, setState] = useState<SimState>(INITIAL);
  const set = <K extends keyof SimState>(key: K) => (value: SimState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  // الحسابات المشتقة — تُعاد فقط عند تغيّر المدخلات
  const derived = useMemo(() => {
    switch (procedure?.kind) {
      case 'titration':
        return { titration: titrationReadout(state.volume) };
      case 'flame':
        return { flame: flameState(state.air) };
      case 'stir':
        return { stir: stirState(state.rpm) };
      case 'wave':
        return { signal: signalReadout({ freqHz: state.freq, ampV: state.amp }) };
      case 'focus':
        return { clarity: focusClarity(state.focus), blur: focusBlur(state.focus) };
      case 'centrifuge':
        return { centrifuge: centrifugeState(state.spinRpm, state.seconds) };
      case 'compass':
        return { compass: compassReadout(state.strike, state.dip) };
      case 'blood-pressure':
        return { bp: bloodPressureReadout(state.pressure) };
      default:
        return {};
    }
  }, [procedure?.kind, state]);

  if (!procedure) return null;

  const readoutText = (() => {
    switch (procedure.kind) {
      case 'titration':
        return `الحجم ${derived.titration!.volumeMl} mL · الخطأ ${derived.titration!.errorMl} mL · ${derived.titration!.verdict}`;
      case 'flame':
        return `${derived.flame!.temperatureC} °C · ${derived.flame!.label}`;
      case 'stir':
        return `${derived.stir!.rpm} rpm · ${derived.stir!.label}`;
      case 'wave':
        return `الدور ${derived.signal!.periodMs} ms · Vpp ${derived.signal!.vpp} V · ${derived.signal!.freqHz} Hz`;
      case 'focus':
        return `الوضوح ${derived.clarity}% · الضبابية ${derived.blur} px`;
      case 'centrifuge':
        return `${derived.centrifuge!.rcf} ×g · الانفصال ${derived.centrifuge!.separation}% · ${derived.centrifuge!.label}`;
      case 'compass':
        return `${derived.compass!.strikeText} · الميل ${derived.compass!.dip}° · ${derived.compass!.label}`;
      case 'blood-pressure':
        return `${derived.bp!.reading} mmHg · ${derived.bp!.label}`;
    }
  })();

  return (
    <section
      data-testid="equipment-simulator"
      data-no-swipe
      role="dialog"
      aria-label={`${procedure.title} — ${asset.name}`}
      className="pointer-events-auto absolute inset-x-2 bottom-2 z-30 mx-auto w-[min(100%,22rem)] overflow-hidden rounded-2xl border border-amber-300/25 bg-slate-950/95 text-slate-100 shadow-2xl shadow-black/50 backdrop-blur-md"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <header className="flex items-start justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div className="min-w-0">
          <h3 className="truncate text-xs font-bold text-amber-100">{procedure.title}</h3>
          <p className="truncate text-[10px] text-slate-400">{asset.name}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-testid="sim-reset"
            aria-label="إعادة ضبط التجربة"
            title="إعادة ضبط"
            onClick={() => setState(INITIAL)}
            className="rounded-lg p-1 text-slate-300 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            data-testid="sim-close"
            aria-label="إغلاق التجربة (Esc)"
            title="إغلاق (Esc)"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-300 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="px-2 pt-1">
        {procedure.kind === 'titration' && <TitrationStage volume={state.volume} color={derived.titration!.color} />}
        {procedure.kind === 'flame' && <FlameStage air={state.air} />}
        {procedure.kind === 'stir' && <StirStage rpm={state.rpm} />}
        {procedure.kind === 'wave' && <WaveStage freq={state.freq} amp={state.amp} />}
        {procedure.kind === 'focus' && <FocusStage focus={state.focus} />}
        {procedure.kind === 'centrifuge' && <CentrifugeStage rpm={state.spinRpm} seconds={state.seconds} />}
        {procedure.kind === 'compass' && <CompassStage strike={state.strike} dip={state.dip} />}
        {procedure.kind === 'blood-pressure' && <BloodPressureStage pressure={state.pressure} />}
      </div>

      <div className="space-y-2 px-3 pb-2">
        {procedure.kind === 'titration' && (
          <Slider
            label="حجم الصودا المضاف"
            value={state.volume}
            min={0}
            max={25}
            step={0.1}
            unit="mL"
            testid="sim-control-volume"
            onChange={set('volume')}
          />
        )}
        {procedure.kind === 'flame' && (
          <Slider
            label="فتحة الهواء"
            value={state.air}
            min={0}
            max={100}
            step={1}
            unit="%"
            testid="sim-control-air"
            onChange={set('air')}
          />
        )}
        {procedure.kind === 'stir' && (
          <Slider
            label="سرعة المقلب"
            value={state.rpm}
            min={0}
            max={1400}
            step={20}
            unit="rpm"
            testid="sim-control-rpm"
            onChange={set('rpm')}
          />
        )}
        {procedure.kind === 'wave' && (
          <>
            <Slider
              label="التردد"
              value={state.freq}
              min={50}
              max={500}
              step={10}
              unit="Hz"
              testid="sim-control-freq"
              onChange={set('freq')}
            />
            <Slider
              label="سعة الإشارة"
              value={state.amp}
              min={0.5}
              max={5}
              step={0.5}
              unit="V"
              testid="sim-control-amp"
              onChange={set('amp')}
            />
          </>
        )}
        {procedure.kind === 'focus' && (
          <Slider
            label="عجلة التركيز"
            value={state.focus}
            min={0}
            max={100}
            step={1}
            unit="%"
            testid="sim-control-focus"
            onChange={set('focus')}
          />
        )}
        {procedure.kind === 'centrifuge' && (
          <>
            <Slider
              label="السرعة"
              value={state.spinRpm}
              min={0}
              max={12000}
              step={100}
              unit="rpm"
              testid="sim-control-spin"
              onChange={set('spinRpm')}
            />
            <Slider
              label="الزمن"
              value={state.seconds}
              min={0}
              max={120}
              step={5}
              unit="s"
              testid="sim-control-seconds"
              onChange={set('seconds')}
            />
          </>
        )}
        {procedure.kind === 'compass' && (
          <>
            <Slider
              label="اتجاه الطبقة (strike)"
              value={state.strike}
              min={0}
              max={355}
              step={5}
              unit="°"
              testid="sim-control-strike"
              onChange={set('strike')}
            />
            <Slider
              label="الميل (dip)"
              value={state.dip}
              min={0}
              max={90}
              step={5}
              unit="°"
              testid="sim-control-dip"
              onChange={set('dip')}
            />
          </>
        )}
        {procedure.kind === 'blood-pressure' && (
          <Slider
            label="ضغط الكُمّ أثناء التفريغ"
            value={state.pressure}
            min={0}
            max={200}
            step={5}
            unit="mmHg"
            testid="sim-control-pressure"
            onChange={set('pressure')}
          />
        )}

        <div data-testid="sim-readout" className="flex flex-wrap gap-1.5" aria-live="polite">
          {procedure.kind === 'titration' && (
            <>
              <Chip label="الحجم" value={`${derived.titration!.volumeMl} mL`} />
              <Chip label="التكافؤ" value={`${derived.titration!.equivalenceMl} mL`} />
              <Chip label="الخطأ" value={`${derived.titration!.errorMl} mL`} />
            </>
          )}
          {procedure.kind === 'flame' && <Chip label="الحرارة" value={`${derived.flame!.temperatureC} °C`} />}
          {procedure.kind === 'stir' && (
            <>
              <Chip label="السرعة" value={`${derived.stir!.rpm} rpm`} />
              <Chip label="الدوّامة" value={`${Math.round(derived.stir!.vortex * 100)}%`} />
            </>
          )}
          {procedure.kind === 'wave' && (
            <>
              <Chip label="الدور" value={`${derived.signal!.periodMs} ms`} />
              <Chip label="Vpp" value={`${derived.signal!.vpp} V`} />
            </>
          )}
          {procedure.kind === 'focus' && (
            <>
              <Chip label="الوضوح" value={`${derived.clarity}%`} />
              <Chip label="ضبابية" value={`${derived.blur} px`} />
            </>
          )}
          {procedure.kind === 'centrifuge' && (
            <>
              <Chip label="RCF" value={`${derived.centrifuge!.rcf} ×g`} />
              <Chip label="الانفصال" value={`${derived.centrifuge!.separation}%`} />
            </>
          )}
          {procedure.kind === 'compass' && (
            <>
              <Chip label="الاتجاه" value={derived.compass!.strikeText} />
              <Chip label="الميل" value={`${derived.compass!.dip}°`} />
            </>
          )}
          {procedure.kind === 'blood-pressure' && <Chip label="القراءة" value={`${derived.bp!.reading} mmHg`} />}
        </div>

        <p data-testid="sim-verdict" className={cn('text-[11px] leading-5 text-amber-200/90')}>
          {procedure.kind === 'titration'
            ? derived.titration!.verdict
            : procedure.kind === 'flame'
              ? derived.flame!.label
              : procedure.kind === 'stir'
                ? derived.stir!.label
                : procedure.kind === 'focus'
                  ? (derived.clarity ?? 0) >= 90
                    ? 'الصورة واضحة عند البؤرة'
                    : 'حرّك العجلة حتى تتضح الخلايا'
                  : procedure.kind === 'centrifuge'
                    ? derived.centrifuge!.label
                    : procedure.kind === 'compass'
                      ? derived.compass!.label
                      : procedure.kind === 'blood-pressure'
                        ? derived.bp!.label
                        : procedure.hint}
        </p>
        <p className="sr-only" data-testid="sim-summary">
          {readoutText}
        </p>
      </div>
    </section>
  );
}
