/**
 * مكوّن شريحة جاهز للاستعمال داخل العرض — يغلّف FlyoverCanvas مع بطاقة ختامية
 * يُستعمل كمحتوى شريحة: content: <FlyoverScene brand="..." tagline="..." />
 */

import { useState } from 'react';
import { FlyoverCanvas } from '@/cinematic/flyover/FlyoverCanvas';
import type { FlyoverConfig } from '@/cinematic/flyover/legacy-types';

export interface FlyoverSceneProps {
  brand?: string;
  tagline?: string;
  duration?: number;
  speed?: number;
  depthIntensity?: number;
  config?: Partial<FlyoverConfig>;
  height?: string;
}

export function FlyoverScene({
  brand = 'قالب العرض التقديمي',
  tagline = 'حكاية تُروى بحركةٍ سينمائية',
  duration = 16,
  speed = 1,
  depthIntensity = 0.85,
  config,
  height = '520px',
}: FlyoverSceneProps) {
  const [playing, setPlaying] = useState(true);

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 shadow-2xl">
      <div style={{ height }} className="relative">
        <FlyoverCanvas
          config={{
            duration,
            speed,
            depthIntensity,
            finale: { brand, tagline, duration: 3 },
            ...config,
          }}
          demo
          autoPlay={playing}
          className="h-full w-full"
        />
        <button
          onClick={() => setPlaying((v) => !v)}
          className="absolute bottom-3 left-3 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur hover:bg-white/15"
        >
          {playing ? 'إيقاف' : 'تشغيل'}
        </button>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="text-sm font-bold text-amber-300">{brand}</div>
        <div className="text-xs text-slate-400">{tagline}</div>
      </div>
    </div>
  );
}

export default FlyoverScene;
