import { useCallback, useRef, useState } from 'react';
import { Gauge, Repeat, Pause, Play, RotateCcw, Maximize2, Volume2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatTime } from '@/cinematic/utils';

export interface ShowreelControlsProps {
  duration: number;
  time: number;
  playing: boolean;
  loop: boolean;
  speed: number;
  /** نقاط التحكم في مسار الكاميرا (0..1) */
  keyframes: number[];
  accent?: string;
  onToggle: () => void;
  onRestart: () => void;
  onSeek: (seconds: number) => void;
  onLoop: (loop: boolean) => void;
  onSpeed: (speed: number) => void;
  onFullscreen?: () => void;
  className?: string;
}

/**
 * شريط تحكم المشغّل: تشغيل/إيقاف، مسح زمني بدقة الإطار، سرعة، تكرار،
 * وعلامات نقاط مسار الكاميرا على المسار نفسه.
 */
export function ShowreelControls({
  duration,
  time,
  playing,
  loop,
  speed,
  keyframes,
  accent = '#f5b544',
  onToggle,
  onRestart,
  onSeek,
  onLoop,
  onSpeed,
  onFullscreen,
  className,
}: ShowreelControlsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverT, setHoverT] = useState<number | null>(null);
  const progress = duration > 0 ? Math.min(1, Math.max(0, time / duration)) : 0;

  const seekFromEvent = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    seekFromEvent(e.clientX);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setHoverT(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
    if (e.buttons === 1) seekFromEvent(e.clientX);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-[#080d18]/85 p-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl',
        className,
      )}
    >
      {/* المسار الزمني */}
      <div
        ref={trackRef}
        dir="ltr"
        role="slider"
        aria-label="الموضع الزمني للعرض"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={Number(time.toFixed(2))}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverT(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') onSeek(Math.min(duration, time + 0.25));
          if (e.key === 'ArrowLeft') onSeek(Math.max(0, time - 0.25));
          if (e.key === 'Home') onSeek(0);
          if (e.key === 'End') onSeek(duration);
        }}
        className="group relative h-9 cursor-pointer touch-none select-none focus-visible:outline-none"
      >
        {/* الخلفية */}
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${accent}55, ${accent})`,
              boxShadow: `0 0 18px ${accent}66`,
            }}
          />
        </div>

        {/* نقاط الكاميرا */}
        {keyframes.map((k, i) => (
          <span
            key={i}
            title={`نقطة ${i + 1} — ${formatTime(k * duration)}`}
            className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] border border-white/25 bg-slate-900"
            style={{ left: `${k * 100}%` }}
          />
        ))}

        {/* منطقة التركيز (خلفية الكاميرا) */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-px -translate-y-1/2 bg-white/10"
          style={{ left: '84%', right: 0 }}
        />

        {/* المقبض */}
        <span
          className="absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90 shadow-[0_0_0_4px_rgba(245,181,68,0.18)] transition group-hover:scale-110"
          style={{ left: `${progress * 100}%`, background: accent }}
        />

        {/* تلميح الزمن */}
        {hoverT !== null && (
          <span
            dir="ltr"
            className="pointer-events-none absolute -top-1 z-20 -translate-x-1/2 rounded-md border border-white/10 bg-slate-950/95 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-200"
            style={{ left: `${hoverT * 100}%` }}
          >
            {formatTime(hoverT * duration)}
          </span>
        )}
      </div>

      {/* الأزرار */}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-950 shadow-[0_6px_24px_-8px_rgba(245,181,68,0.9)] transition hover:brightness-110"
          style={{ background: accent }}
        >
          {playing ? <Pause className="h-4.5 w-4.5" fill="currentColor" /> : <Play className="ms-0.5 h-4.5 w-4.5 -scale-x-100" fill="currentColor" />}
        </button>

        <button
          type="button"
          onClick={onRestart}
          aria-label="إعادة من البداية"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <div dir="ltr" className="ms-1 flex items-baseline gap-1 font-mono text-xs tabular-nums">
          <span className="text-sm font-bold text-slate-100">{formatTime(time)}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{formatTime(duration)}</span>
        </div>

        <div className="ms-auto flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onLoop(!loop)}
            aria-pressed={loop}
            title="تكرار"
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-bold transition',
              loop
                ? 'border-amber-300/40 bg-amber-400/15 text-amber-200'
                : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07]',
            )}
          >
            <Repeat className="h-3.5 w-3.5" />
            تكرار
          </button>

          <label className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 text-[11px] font-bold text-slate-400">
            <Gauge className="h-3.5 w-3.5" />
            <span className="sr-only">سرعة التشغيل</span>
            <select
              value={speed}
              onChange={(e) => onSpeed(Number(e.target.value))}
              className="bg-transparent text-[11px] font-bold text-slate-200 outline-none"
              dir="ltr"
            >
              {[0.25, 0.5, 0.75, 1, 1.5, 2].map((v) => (
                <option key={v} value={v} className="bg-slate-900">
                  {v}×
                </option>
              ))}
            </select>
          </label>

          <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-bold text-slate-500 sm:inline-flex">
            <Volume2 className="h-3.5 w-3.5" />
            بلا صوت
          </span>

          {onFullscreen && (
            <button
              type="button"
              onClick={onFullscreen}
              aria-label="ملء الشاشة"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/10"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
