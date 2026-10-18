import { useId, useMemo } from 'react';
import Particles, { ParticlesProvider } from '@tsparticles/react';
import type { ISourceOptions } from '@tsparticles/engine';
import type { Engine } from '@tsparticles/engine';
import { cn } from '@/lib/cn';

import type { ParticlesPreset } from '@/types/effects';

/** تهيئة المحرك مرة واحدة (مرجع ثابت كما يشترط ParticlesProvider) مع تحميل الحزمة الخفيفة عند الحاجة فقط. */
const initSlim = async (engine: Engine) => {
  const { loadSlim } = await import('@tsparticles/slim');
  await loadSlim(engine);
};

const BASE: ISourceOptions = {
  fullScreen: { enable: false },
  fpsLimit: 60,
  detectRetina: true,
  pauseOnBlur: true,
  background: { color: { value: 'transparent' } },
  interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
};

function preset(name: ParticlesPreset, density: number, color?: string): ISourceOptions {
  switch (name) {
    case 'stars':
      return {
        ...BASE,
        particles: {
          number: { value: Math.round(90 * density) },
          color: { value: color ?? '#ffffff' },
          shape: { type: 'circle' },
          opacity: { value: { min: 0.1, max: 0.7 }, animation: { enable: true, speed: 0.5, sync: false } },
          size: { value: { min: 0.4, max: 1.8 } },
          move: { enable: true, speed: 0.15, direction: 'none', random: true, straight: false, outModes: { default: 'out' } },
        },
      };
    case 'network':
      return {
        ...BASE,
        particles: {
          number: { value: Math.round(50 * density) },
          color: { value: color ?? '#fbbf24' },
          shape: { type: 'circle' },
          opacity: { value: 0.5 },
          size: { value: { min: 1, max: 3 } },
          links: { enable: true, color: color ?? '#fbbf24', distance: 150, opacity: 0.25, width: 1 },
          move: { enable: true, speed: 0.6, direction: 'none', outModes: { default: 'bounce' } },
        },
      };
    case 'snow':
      return {
        ...BASE,
        particles: {
          number: { value: Math.round(70 * density) },
          color: { value: color ?? '#e2e8f0' },
          shape: { type: 'circle' },
          opacity: { value: { min: 0.3, max: 0.8 } },
          size: { value: { min: 1, max: 4 } },
          move: { enable: true, speed: { min: 0.5, max: 1.5 }, direction: 'bottom', random: true, straight: false, outModes: { default: 'out' } },
        },
      };
    case 'bubbles':
      return {
        ...BASE,
        particles: {
          number: { value: Math.round(30 * density) },
          color: { value: color ?? '#38bdf8' },
          shape: { type: 'circle' },
          opacity: { value: { min: 0.05, max: 0.25 } },
          size: { value: { min: 6, max: 28 } },
          move: { enable: true, speed: { min: 0.3, max: 1 }, direction: 'top', random: true, straight: false, outModes: { default: 'out' } },
        },
      };
    case 'fireflies':
      return {
        ...BASE,
        particles: {
          number: { value: Math.round(40 * density) },
          color: { value: color ?? '#fde68a' },
          shape: { type: 'circle' },
          opacity: { value: { min: 0, max: 0.9 }, animation: { enable: true, speed: 1.2, sync: false } },
          size: { value: { min: 1, max: 3 } },
          move: { enable: true, speed: 0.4, direction: 'none', random: true, straight: false, outModes: { default: 'out' } },
        },
      };
  }
}

export interface ParticlesBackgroundProps {
  preset?: ParticlesPreset;
  /** مضاعف الكثافة (1 = الافتراضي الهادئ) */
  density?: number;
  /** لون الجسيمات (افتراضي حسب الإعداد المسبق) */
  color?: string;
  className?: string;
  /** إعدادات tsParticles كاملة بديلة عن الإعداد المسبق */
  options?: ISourceOptions;
}

/** التنفيذ الفعلي لخلفية الجسيمات — لا تستورده مباشرة؛ استعمل ParticlesBackground (كسول). */
export default function ParticlesCanvas({ preset: name = 'stars', density = 1, color, className, options }: ParticlesBackgroundProps) {
  const id = `particles-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const resolved = useMemo(() => options ?? preset(name, density, color), [options, name, density, color]);
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <ParticlesProvider init={initSlim}>
        <Particles id={id} options={resolved} className="h-full w-full" />
      </ParticlesProvider>
    </div>
  );
}
