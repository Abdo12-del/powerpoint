/**
 * مكون شريحة جاهز للاستعمال داخل العرض — يغلّف MotionShowreel
 */

import { MotionShowreel } from '@/showreel/MotionShowreel';
import type { ShowreelConfig } from '@/showreel/types';

export interface MotionDesignShowreelProps {
  brand?: string;
  tagline?: string;
  bpm?: number;
  config?: Partial<ShowreelConfig>;
  height?: string;
}

export function MotionDesignShowreel({
  brand = 'STUDIO SHOWREEL',
  tagline = 'حكاية تُروى بالحركة — Motion Design سينمائي',
  bpm = 128,
  config,
  height = '520px',
}: MotionDesignShowreelProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 shadow-2xl">
      <MotionShowreel config={{ brand, tagline, bpm, ...config }} height={height} />
      <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="text-sm font-bold text-amber-300">{brand}</div>
        <div className="text-xs text-slate-400">{tagline} · 15s · BPM {bpm}</div>
      </div>
    </div>
  );
}

export default MotionDesignShowreel;
