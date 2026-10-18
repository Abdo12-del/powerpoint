import { FONTS, fontStack, type FontDef, type FontId, type FontRole } from './registry';
import { resolveRoles, type TypographyConfig } from './presets';

export interface ResolvedTypography {
  preset: string;
  roles: Record<FontRole, FontDef>;
  latin?: FontDef;
  /** القيم التي وُضعت في متغيرات CSS */
  vars: Record<string, string>;
}

const loaded = new Set<FontId>();

/** تحميل CSS خط واحد مرة واحدة (آمن للاستدعاء المتكرر) */
export async function ensureFontLoaded(id: FontId): Promise<void> {
  if (loaded.has(id)) return;
  loaded.add(id);
  try {
    await FONTS[id].load();
  } catch (err) {
    loaded.delete(id);
    console.warn(`[typography] تعذّر تحميل الخط ${id}`, err);
  }
}

/** يحسب متغيرات CSS للإعدادات دون لمس DOM (قابل للاختبار) */
export function computeTypographyVars(config: TypographyConfig = {}): ResolvedTypography {
  const ids = resolveRoles(config);
  const latin = config.latin ? FONTS[config.latin] : undefined;
  const roles: Record<FontRole, FontDef> = {
    heading: FONTS[ids.heading],
    body: FONTS[ids.body],
    display: FONTS[ids.display],
    mono: FONTS[ids.mono],
  };
  const vars: Record<string, string> = {
    '--font-heading': fontStack(roles.heading, latin),
    '--font-body': fontStack(roles.body, latin),
    '--font-display': fontStack(roles.display, latin),
    '--font-mono': fontStack(roles.mono),
    '--leading-body': String(roles.body.lineHeight),
    '--leading-heading': String(Math.max(1.2, roles.heading.lineHeight - 0.3)),
    '--type-scale': String(config.scale ?? 1),
  };
  return { preset: config.preset ?? 'default', roles, latin, vars };
}

/**
 * يطبّق إعدادات الطباعة: يحمّل الخطوط المختارة كسولاً ثم يضبط متغيرات CSS على :root.
 * يُستدعى مرة في main.tsx قبل الرسم، ويمكن استدعاؤه لاحقاً للتبديل الحي (مختبر الخطوط).
 */
export async function applyTypography(
  config: TypographyConfig = {},
  root: HTMLElement | null = typeof document === 'undefined' ? null : document.documentElement,
): Promise<ResolvedTypography> {
  const resolved = computeTypographyVars(config);
  const ids = new Set<FontId>([resolved.roles.heading.id, resolved.roles.body.id, resolved.roles.display.id, resolved.roles.mono.id]);
  if (resolved.latin) ids.add(resolved.latin.id);
  await Promise.all([...ids].map(ensureFontLoaded));
  if (root) {
    for (const [k, v] of Object.entries(resolved.vars)) root.style.setProperty(k, v);
    root.dataset.typography = resolved.preset;
  }
  return resolved;
}

/** تهيئة واجهة document.fonts (إن وُجدت) لتقليل وميض الخط عند أول شريحة */
export async function warmUpFonts(families: string[], text = 'أبجد هوز 0123'): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.all(families.map((f) => document.fonts.load(`700 24px '${f}'`, text).catch(() => undefined)));
  } catch {
    /* تجاهل — الخط سيظهر عند جاهزيته (font-display: swap) */
  }
}
