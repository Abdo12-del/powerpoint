import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * دمج أصناف Tailwind (clsx + tailwind-merge) — يقبل نصوصاً وكائنات ومصفوفات،
 * ويحلّ التعارضات (`p-2 p-4` → `p-4`) كما في shadcn/Magic UI.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
