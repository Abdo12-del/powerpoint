// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  FONTS,
  FONT_IDS,
  FONT_LIST,
  FONT_CATEGORY_LABELS,
  fontStack,
  fontsByCategory,
  PRESET_IDS,
  PRESET_LIST,
  TYPOGRAPHY_PRESETS,
  resolveRoles,
  computeTypographyVars,
  applyTypography,
  ensureFontLoaded,
  type FontCategory,
} from '@/fonts';
import { typography } from '@/data/typography';
import {
  VariableText,
  KineticHeadline,
  ClipReveal,
  clipStart,
  HighlightSweep,
  FancyText,
  fancyStyle,
  FontSpecimen,
  weightSteps,
} from '@/components/typography';
import * as typo from '@/components/typography';

const CATEGORIES: FontCategory[] = ['modern', 'kufi', 'naskh', 'ruqaa', 'display', 'rounded', 'latin', 'mono'];

// لا نحمّل ملفات CSS الحقيقية في الاختبار — نستبدل load بدالة وهمية
beforeEach(() => {
  for (const f of FONT_LIST) f.load = vi.fn(() => Promise.resolve());
});

describe('سجل الخطوط', () => {
  it('المعرّفات فريدة ومطابقة للمفاتيح وكل خط مكتمل البيانات', () => {
    expect(new Set(FONT_IDS).size).toBe(FONT_IDS.length);
    expect(FONT_LIST.length).toBe(FONT_IDS.length);
    for (const id of FONT_IDS) {
      const f = FONTS[id];
      expect(f.id).toBe(id);
      expect(f.family.length).toBeGreaterThan(0);
      expect(f.label.length).toBeGreaterThan(0);
      expect(CATEGORIES).toContain(f.category);
      expect(f.roles.length).toBeGreaterThan(0);
      expect(f.weights[0]).toBeLessThanOrEqual(f.weights[1]);
      expect(typeof f.load).toBe('function');
      if (f.variable) expect(f.axes?.wght ?? f.axes?.wdth).toBeDefined();
    }
  });

  it('يغطي أنواع الخط العربي الأساسية بعدد كافٍ', () => {
    const arabic = FONT_LIST.filter((f) => f.scripts.includes('arabic'));
    expect(arabic.length).toBeGreaterThanOrEqual(20);
    for (const c of ['modern', 'kufi', 'naskh', 'ruqaa', 'display', 'rounded'] as FontCategory[])
      expect(fontsByCategory(c).length, c).toBeGreaterThan(0);
    expect(fontsByCategory('mono').length).toBeGreaterThanOrEqual(2);
    for (const c of CATEGORIES) expect(FONT_CATEGORY_LABELS[c]).toBeTruthy();
  });

  it('الخطوط المتغيرة تعلن مداها وهي أغلبية الكتالوج', () => {
    const variable = FONT_LIST.filter((f) => f.variable);
    expect(variable.length).toBeGreaterThanOrEqual(15);
    expect(FONTS['noto-sans-arabic'].axes?.wdth).toEqual([62.5, 100]);
    expect(FONTS['readex-pro'].axes?.HEXP).toEqual([0, 100]);
  });

  it('fontStack يضع العائلة بين علامتي اقتباس ثم الاحتياطي ويضيف اللاتيني المرافق', () => {
    expect(fontStack(FONTS.cairo)).toMatch(/^'Cairo Variable', .*sans-serif$/);
    expect(fontStack(FONTS.amiri, FONTS.inter)).toBe(`'Amiri', 'Inter Variable', ${FONTS.amiri.fallback}`);
    expect(fontStack(FONTS.cairo, FONTS.cairo).match(/Cairo Variable/g)?.length).toBe(1);
  });
});

describe('الاقترانات الجاهزة', () => {
  it('كل اقتران يشير إلى خطوط موجودة بأدوار مناسبة', () => {
    expect(PRESET_LIST.length).toBe(PRESET_IDS.length);
    for (const p of PRESET_LIST) {
      expect(TYPOGRAPHY_PRESETS[p.id]).toBe(p);
      for (const [role, id] of Object.entries(p.fonts)) {
        const f = FONTS[id as keyof typeof FONTS];
        expect(f, `${p.id}.${role} → ${id}`).toBeDefined();
        if (role === 'mono') expect(f.category).toBe('mono');
        else expect(f.scripts).toContain('arabic');
        if (role === 'body') expect(f.roles).toContain('body');
      }
    }
  });

  it('الافتراضي يحافظ على مظهر القالب (Cairo + JetBrains Mono) والتجاوزات تعمل', () => {
    expect(resolveRoles()).toEqual({ heading: 'cairo', body: 'cairo', display: 'cairo', mono: 'jetbrains-mono' });
    expect(resolveRoles({ preset: 'academic', display: 'katibeh' })).toMatchObject({ heading: 'changa', body: 'cairo', display: 'katibeh' });
    expect(typography.preset ?? 'default').toBe('default');
  });

  it('computeTypographyVars ينتج متغيرات CSS للأدوار الأربعة دون DOM', () => {
    const r = computeTypographyVars({ preset: 'heritage', latin: 'inter', scale: 1.05 });
    expect(r.vars['--font-heading']).toContain("'Amiri'");
    expect(r.vars['--font-heading']).toContain("'Inter Variable'");
    expect(r.vars['--font-body']).toContain("'Scheherazade New'");
    expect(r.vars['--font-display']).toContain("'Katibeh'");
    expect(r.vars['--font-mono']).toContain("'JetBrains Mono'");
    expect(r.vars['--type-scale']).toBe('1.05');
    expect(Number(r.vars['--leading-body'])).toBeGreaterThan(1.5);
  });
});

describe('تطبيق الطباعة على المستند', () => {
  it('applyTypography يحمّل الخطوط المختارة مرة واحدة ويضبط المتغيرات على :root', async () => {
    const root = document.documentElement;
    const r = await applyTypography({ preset: 'academic' }, root);
    expect(r.preset).toBe('academic');
    expect(root.style.getPropertyValue('--font-heading')).toContain("'Changa Variable'");
    expect(root.style.getPropertyValue('--font-display')).toContain("'Amiri'");
    expect(root.dataset.typography).toBe('academic');
    expect(FONTS.changa.load).toHaveBeenCalledTimes(1);
    expect(FONTS.amiri.load).toHaveBeenCalledTimes(1);
    expect(FONTS.tajawal.load).not.toHaveBeenCalled();
    await ensureFontLoaded('changa');
    expect(FONTS.changa.load).toHaveBeenCalledTimes(1);
  });

  it('فشل تحميل خط لا يُسقط التطبيق', async () => {
    FONTS.rakkas.load = vi.fn(() => Promise.reject(new Error('offline')));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const r = await applyTypography({ display: 'rakkas' }, null);
    expect(r.roles.display.id).toBe('rakkas');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('مكونات حركة النص', () => {
  it('الفهرس يصدّر كل المكونات', () => {
    for (const n of [
      'VariableText',
      'KineticHeadline',
      'ClipReveal',
      'clipStart',
      'HighlightSweep',
      'FancyText',
      'fancyStyle',
      'FontSpecimen',
      'weightSteps',
    ])
      expect(typo).toHaveProperty(n);
  });

  it('KineticHeadline يقسّم بالكلمات فقط ويبرز الكلمة المطلوبة', () => {
    const html = renderToStaticMarkup(<KineticHeadline as="h1" text="نظام معلوماتي لتسيير المطاعم" highlight={['المطاعم']} />);
    expect(html).toContain('<h1');
    expect(html).toContain('>نظام<');
    expect(html).toContain('>المطاعم<');
    expect(html).not.toContain('>ن<');
    expect(html).toContain('text-amber-300');
    expect(html).toContain('font-heading');
    expect(html).toContain('aria-label="نظام معلوماتي لتسيير المطاعم"');
  });

  it('VariableText يبدأ من قيمة المحور الابتدائية عبر font-variation-settings', () => {
    const html = renderToStaticMarkup(
      <VariableText as="h2" from={300} to={800}>
        عنوان
      </VariableText>,
    );
    expect(html).toContain('font-variation-settings:&quot;wght&quot; 300');
    const wdth = renderToStaticMarkup(
      <VariableText axis="wdth" from={62.5} to={100}>
        نص
      </VariableText>,
    );
    expect(wdth).toContain('&quot;wdth&quot; 62.5');
  });

  it('ClipReveal يبدأ القناع من اليمين في RTL ومن اليسار في LTR', () => {
    expect(clipStart('start', 'rtl')).toBe('inset(0 0 0 100%)');
    expect(clipStart('start', 'ltr')).toBe('inset(0 100% 0 0)');
    expect(clipStart('end', 'rtl')).toBe('inset(0 100% 0 0)');
    expect(clipStart('up')).toBe('inset(100% 0 0 0)');
    const html = renderToStaticMarkup(<ClipReveal as="h2">عنوان</ClipReveal>);
    expect(html).toContain('clip-path:inset(0 0 0 100%)');
  });

  it('HighlightSweep يمسح من اليمين ولا يغيّر النص', () => {
    const html = renderToStaticMarkup(<HighlightSweep>٩٥٪</HighlightSweep>);
    expect(html).toContain('background-position:100% 88%');
    expect(html).toContain('background-size:0% 45%');
    expect(html).toContain('>٩٥٪<');
  });

  it('FancyText: الأنماط الخمسة آمنة للعربية (بلا letter-spacing)', () => {
    for (const v of ['gradient', 'outline', 'glow', 'shadow3d', 'emboss'] as const) {
      const style = fancyStyle(v);
      expect(style).not.toHaveProperty('letterSpacing');
      expect(renderToStaticMarkup(<FancyText variant={v}>تخرّج</FancyText>)).toContain('تخرّج');
    }
    expect(
      renderToStaticMarkup(
        <FancyText variant="gradient" animated>
          تدرج
        </FancyText>,
      ),
    ).toContain('animate-gradient');
    expect(fancyStyle('outline').WebkitTextStroke).toContain('1.5px');
  });

  it('FontSpecimen يعرض سلّم الأوزان ويستعمل مكدس الخط', () => {
    expect(weightSteps(FONTS.cairo)).toEqual([200, 400, 600, 800, 1000]);
    expect(weightSteps(FONTS.amiri)).toEqual([400, 700]);
    expect(weightSteps(FONTS.katibeh)).toEqual([400]);
    const html = renderToStaticMarkup(<FontSpecimen font={FONTS['noto-kufi-arabic']} />);
    expect(html).toContain('data-font="noto-kufi-arabic"');
    expect(html).toContain('Noto Kufi Arabic Variable');
    expect(html).toContain('wght 100–900');
  });
});

describe('مختبر الخطوط', () => {
  it('يُرسم بكل الاقترانات وأقسام الكتالوج', async () => {
    const { default: FontLab } = await import('@/components/typography/FontLab');
    const html = renderToStaticMarkup(<FontLab />);
    for (const p of PRESET_LIST) expect(html).toContain(`preset: &#x27;${p.id}&#x27;`);
    for (const f of FONT_LIST) expect(html).toContain(`data-font="${f.id}"`);
    expect(html).toContain('حركات النص العربي');
  });
});
