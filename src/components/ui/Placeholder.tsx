import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/cn';

/** الأنماط العشرة (§5) — تُعرض كتذكير داخل الشريحة الفارغة. */
const ARCHETYPES: { n: number; key: string; name: string; component: string }[] = [
  { n: 1, key: 'profile', name: 'بطاقة تعريف', component: 'ProfileCard' },
  { n: 2, key: 'bullets', name: 'قائمة نقاط', component: 'BulletCards' },
  { n: 3, key: 'timeline', name: 'خط زمني', component: 'Timeline' },
  { n: 4, key: 'tree', name: 'هيكل شجري', component: 'OrgTree' },
  { n: 5, key: 'comparison', name: 'مقارنة زوجية', component: 'Comparison' },
  { n: 6, key: 'process', name: 'سير إجراء', component: 'ProcessFlow' },
  { n: 7, key: 'table', name: 'جدول بيانات', component: 'DataTable' },
  { n: 8, key: 'relation', name: 'مخطط علائقي', component: 'RelationDiagram' },
  { n: 9, key: 'code', name: 'كود / نموذج تقني', component: 'CodeBlock' },
  { n: 10, key: 'stats', name: 'إحصائيات', component: 'StatCounters' },
];

export interface PlaceholderProps {
  /** ما الذي يجب أن يوضع هنا؟ («4–6 أهداف»، «سؤال الإشكالية»…) */
  hint?: ReactNode;
  /** نمط مقترح — يُبرز في القائمة */
  suggested?: string;
  /** إخفاء قائمة الأنماط (للمقدمة مثلاً) */
  compact?: boolean;
  className?: string;
}

/**
 * كتلة نائبة لشريحة لم تُملأ بعد.
 * تظهر في القالب الفارغ وتُستبدل بمكوّن أحد الأنماط العشرة (docs/ARCHETYPES.md).
 */
export function Placeholder({ hint, suggested, compact, className }: PlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'mx-auto flex w-full max-w-4xl flex-col items-center gap-5 rounded-3xl border-2 border-dashed border-white/20 bg-white/[0.02] px-6 py-10 text-center',
        className,
      )}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
        <LayoutTemplate className="h-8 w-8" />
      </span>
      <div>
        <div className="text-2xl font-extrabold">شريحة فارغة — ضع المحتوى هنا</div>
        {hint && <p className="mt-2 text-lg text-slate-300">{hint}</p>}
      </div>

      {!compact && (
        <>
          <p className="text-sm text-slate-400">
            صنّف الشريحة بنمط واحد من الأنماط العشرة ثم استبدل <code className="rounded bg-white/10 px-1.5 py-0.5 text-slate-200">{'<Placeholder />'}</code>{' '}
            بمكوّنه من <code className="rounded bg-white/10 px-1.5 py-0.5 text-slate-200">@/components/archetypes</code>
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {ARCHETYPES.map((a) => (
              <li
                key={a.key}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1 text-sm',
                  suggested === a.key ? 'border-amber-400/50 bg-amber-400/15 text-amber-100' : 'border-white/10 bg-white/[0.04] text-slate-300',
                )}
              >
                <span className="font-bold tabular-nums">{a.n}</span>
                <span>{a.name}</span>
                <code dir="ltr" className="font-mono text-[11px] text-sky-200">
                  {a.component}
                </code>
              </li>
            ))}
          </ul>
        </>
      )}
    </motion.div>
  );
}
