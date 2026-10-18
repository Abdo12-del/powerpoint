import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, IconBubble, Stagger, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface BulletItem {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  /** وسم حالة صغير (مثلاً: «قائم» / «مقترح») */
  tag?: string;
  tagTone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

export interface BulletCardsProps {
  /** 4–6 عناصر */
  items: BulletItem[];
  columns?: 2 | 3;
  /** ترقيم العناصر */
  numbered?: boolean;
}

/** النمط 2 — قائمة نقاط: الأهداف، المزايا، العيوب (4–6 بطاقات). */
export function BulletCards({ items, columns = 3, numbered }: BulletCardsProps) {
  return (
    <Stagger
      className={cn(
        'grid content-center gap-4',
        columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3',
      )}
    >
      {items.slice(0, 6).map((item, i) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="flex gap-4">
            {Icon ? (
              <IconBubble icon={Icon} />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-xl font-black text-amber-300 tabular-nums">
                {i + 1}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {numbered && Icon && <span className="text-sm font-bold text-amber-300 tabular-nums">{i + 1}.</span>}
                <h4 className="text-lg font-bold leading-snug">{item.title}</h4>
                {item.tag && (
                  <Badge tone={item.tagTone ?? 'neutral'} className="text-xs">
                    {item.tag}
                  </Badge>
                )}
              </div>
              {item.description && <p className="mt-1 text-[15px] leading-relaxed text-slate-300">{item.description}</p>}
            </div>
          </Card>
        );
      })}
    </Stagger>
  );
}
