import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Building2 } from 'lucide-react';
import { Card, IconBubble, Stagger } from '@/components/ui';

export interface ProfileFact {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
}

export interface ProfileCardProps {
  /** اسم المؤسسة / المنتج / الشخص */
  name: string;
  /** وصف من 2–3 جمل */
  description: ReactNode;
  /** وسم صغير فوق الاسم (القطاع، الفئة…) */
  tag?: string;
  icon?: LucideIcon;
  /** 3–4 حقائق جانبية */
  facts: ProfileFact[];
}

/** النمط 1 — بطاقة تعريف: بطاقة كبيرة + 3–4 حقائق جانبية. */
export function ProfileCard({ name, description, tag, icon = Building2, facts }: ProfileCardProps) {
  return (
    <Stagger className="grid h-full gap-5 lg:grid-cols-[1.6fr_1fr]">
      <Card className="flex flex-col justify-center gap-5 p-8">
        <div className="flex items-center gap-4">
          <IconBubble icon={icon} size="lg" />
          <div>
            {tag && <div className="text-sm font-semibold text-amber-300/90">{tag}</div>}
            <h3 className="text-3xl font-extrabold leading-tight">{name}</h3>
          </div>
        </div>
        <p className="text-lg leading-relaxed text-slate-200/90">{description}</p>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {facts.slice(0, 4).map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.label} className="flex items-center gap-3 p-4">
              {Icon && <IconBubble icon={Icon} size="sm" />}
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-400">{f.label}</div>
                <div className="truncate text-lg font-bold tabular-nums">{f.value}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </Stagger>
  );
}
