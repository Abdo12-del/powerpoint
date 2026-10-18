import type { LucideIcon } from 'lucide-react';
import { OrbitingCircles } from '@/components/gallery';
import { cn } from '@/lib/cn';

export interface EcosystemOrbitProps {
  center: { icon: LucideIcon; label: string };
  inner: LucideIcon[];
  outer?: LucideIcon[];
  className?: string;
}

/**
 * وصفة «نظام ومكوناته» (نمط tree/relation الدائري): عنصر مركزي وحلقتان من الأيقونات تدوران حوله.
 * <EcosystemOrbit center={{ icon: Server, label: 'النظام' }} inner={[Database, Shield]} outer={[Smartphone, Globe, Mail]} />
 */
export function EcosystemOrbit({ center, inner, outer, className }: EcosystemOrbitProps) {
  const Center = center.icon;
  return (
    <div className={cn('relative mx-auto flex h-[380px] w-full max-w-[380px] items-center justify-center', className)}>
      <div className="z-10 flex flex-col items-center gap-2">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-[0_0_40px_rgba(251,191,36,.45)]">
          <Center className="h-9 w-9" />
        </span>
        <span className="text-sm font-bold">{center.label}</span>
      </div>
      <OrbitingCircles radius={95} duration={18} iconSize={40}>
        {inner.map((Icon, i) => (
          <span key={i} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-sky-300">
            <Icon className="h-5 w-5" />
          </span>
        ))}
      </OrbitingCircles>
      {outer && outer.length > 0 && (
        <OrbitingCircles radius={160} duration={28} iconSize={44} reverse>
          {outer.map((Icon, i) => (
            <span key={i} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-amber-200">
              <Icon className="h-5 w-5" />
            </span>
          ))}
        </OrbitingCircles>
      )}
    </div>
  );
}
