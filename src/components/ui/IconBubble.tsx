import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export function IconBubble({
  icon: Icon,
  className,
  size = 'md',
}: {
  icon: LucideIcon;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dims = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-9 w-9' : 'h-12 w-12';
  const icon = size === 'lg' ? 'h-8 w-8' : size === 'sm' ? 'h-4.5 w-4.5' : 'h-6 w-6';
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-amber-300',
        dims,
        className,
      )}
    >
      <Icon className={icon} aria-hidden />
    </span>
  );
}
