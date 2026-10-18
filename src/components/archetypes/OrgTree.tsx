import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Stagger, popIn } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface TreeNode {
  label: string;
  /** الدور / العدد: «6 نُدُل» */
  role?: string;
  icon?: LucideIcon;
  children?: TreeNode[];
}

export interface OrgTreeProps {
  root: TreeNode;
}

function Node({ node, depth }: { node: TreeNode; depth: number }) {
  const Icon = node.icon;
  const hasChildren = !!node.children?.length;
  return (
    <div className="flex flex-col items-center">
      <motion.div
        variants={popIn}
        className={cn(
          'relative z-10 flex min-w-[9rem] flex-col items-center rounded-xl border px-4 py-2 text-center shadow-lg',
          depth === 0
            ? 'border-amber-400/50 bg-amber-400/15 text-amber-100'
            : depth === 1
              ? 'border-sky-400/40 bg-sky-400/10'
              : 'border-white/10 bg-white/[0.05]',
        )}
      >
        {Icon && <Icon className="mb-1 h-5 w-5 opacity-80" />}
        <div className={cn('font-bold leading-tight', depth === 0 ? 'text-lg' : 'text-[15px]')}>{node.label}</div>
        {node.role && <div className="text-xs text-slate-300/80">{node.role}</div>}
      </motion.div>

      {hasChildren && (
        <>
          <span className="h-6 w-px bg-white/25" />
          <div className="relative flex items-start justify-center gap-4">
            {node.children!.length > 1 && (
              <span className="absolute top-0 h-px bg-white/25" style={{ insetInline: `calc(100% / ${node.children!.length} / 2)` }} />
            )}
            {node.children!.map((child) => (
              <div key={child.label} className="flex flex-col items-center">
                <span className="h-6 w-px bg-white/25" />
                <Node node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** النمط 4 — هيكل شجري: التنظيم، التسلسل الإداري (عقد + موصلات). */
export function OrgTree({ root }: OrgTreeProps) {
  return (
    <Stagger stagger={0.06} className="flex h-full items-center justify-center overflow-x-auto py-4">
      <Node node={root} depth={0} />
    </Stagger>
  );
}
