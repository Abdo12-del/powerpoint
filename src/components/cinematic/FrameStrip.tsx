import { useRef, useState } from 'react';
import { Camera, Download, ImageOff, Loader2, ScanLine } from 'lucide-react';
import type { FlyoverHandle } from '@/cinematic/types';
import { cn } from '@/lib/cn';
import { formatTime } from '@/cinematic/utils';

export interface PreviewFrame {
  time: number;
  dataUrl: string;
  label?: string;
}

export interface FrameStripProps {
  stageRef: React.RefObject<FlyoverHandle | null>;
  /** نقاط زمنية بالثواني */
  times: number[];
  duration: number;
  /** بداية الانتقال السينمائي (نسبة) — الإطارات بعدها تعرض خلفية البطاقة الختامية */
  transitionStart?: number;
  accent?: string;
  onSeek: (seconds: number) => void;
  className?: string;
}

/**
 * معاينة الإطارات — تُصيّر المشهد عند نقاط زمنية محددة دون تشغيله،
 * وتعرض شريطاً سينمائياً (filmstrip) قابلاً للنقر والتنزيل.
 */
export function FrameStrip({ stageRef, times, duration, transitionStart = 0.84, accent = '#f5b544', onSeek, className }: FrameStripProps) {
  const [frames, setFrames] = useState<PreviewFrame[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  const captureAll = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    setProgress(0);
    const out: PreviewFrame[] = [];
    try {
      for (let i = 0; i < times.length; i++) {
        const stage = stageRef.current;
        if (!stage) throw new Error('المسرح غير جاهز');
        const url = await stage.getFrameAt(times[i]);
        if (!url) throw new Error('تعذر التقاط الإطار');
        out.push({ time: times[i], dataUrl: url, label: `t=${times[i].toFixed(1)}s` });
        setFrames([...out]);
        setProgress((i + 1) / times.length);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر التقاط الإطارات');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const captureCurrent = async () => {
    const stage = stageRef.current;
    if (!stage || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const tl = stage.getTimeline();
      const url = await stage.getFrameAt(tl.currentTime);
      if (url) setFrames((prev) => [...prev.filter((f) => Math.abs(f.time - tl.currentTime) > 0.02), { time: tl.currentTime, dataUrl: url }].sort((a, b) => a.time - b.time));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر الالتقاط');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <section className={cn('rounded-2xl border border-white/10 bg-[#080d18]/70 p-4 backdrop-blur', className)} aria-label="معاينة الإطارات">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-100">
            <ScanLine className="h-4 w-4" style={{ color: accent }} />
            معاينة الإطارات
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            يُصيَّر المشهد عند نقاط زمنية محددة دون تشغيل الحركة — انقر أي إطار للانتقال إليه.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={captureCurrent}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:opacity-40"
          >
            <Camera className="h-3.5 w-3.5" />
            الإطار الحالي
          </button>
          <button
            type="button"
            onClick={captureAll}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold text-slate-950 transition hover:brightness-110 disabled:opacity-50"
            style={{ background: accent }}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            {busy ? `جاري الالتقاط ${Math.round(progress * 100)}٪` : `التقط ${times.length} إطارات`}
          </button>
        </div>
      </header>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {times.map((time) => {
          const frame = frames.find((f) => Math.abs(f.time - time) < 0.05);
          const inFinal = time / duration >= transitionStart;
          return (
            <div key={time} className="group relative w-36 shrink-0">
              <button
                type="button"
                onClick={() => onSeek(time)}
                className="relative block aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-slate-900/80 transition hover:border-white/30"
                title={`الانتقال إلى ${formatTime(time)}`}
              >
                {frame ? (
                  <img src={frame.dataUrl} alt={`إطار عند ${formatTime(time)}`} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full flex-col items-center justify-center gap-1 text-slate-600">
                    <ImageOff className="h-4 w-4" />
                    <span className="font-mono text-[10px]" dir="ltr">
                      {formatTime(time)}
                    </span>
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1 text-start font-mono text-[10px] text-slate-200" dir="ltr">
                  {formatTime(time)}
                </span>
                {inFinal && (
                  <span className="absolute end-1 top-1 rounded bg-amber-400/90 px-1 py-0.5 text-[8px] font-black text-slate-950">
                    ختام
                  </span>
                )}
              </button>
              {frame && (
                <a
                  href={frame.dataUrl}
                  download={`frame-${time.toFixed(2)}s.jpg`}
                  className="absolute end-1 top-1 rounded-md bg-black/60 p-1 text-white/80 opacity-0 backdrop-blur transition group-hover:opacity-100 hover:text-white"
                  aria-label={`تنزيل إطار ${formatTime(time)}`}
                >
                  <Download className="h-3 w-3" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="mt-2 text-xs font-bold text-rose-300">{error}</p>}
      {frames.length > 0 && (
        <p className="mt-1 font-mono text-[10px] text-slate-500" dir="ltr">
          {frames.length} frames · {duration.toFixed(1)}s · canvas → JPEG
        </p>
      )}
    </section>
  );
}
