// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

// canvas-confetti يحتاج سياق canvas حقيقي — نستبدله بدالة وهمية
vi.mock('canvas-confetti', () => {
  const fn = vi.fn(() => Promise.resolve(undefined));
  return { default: Object.assign(fn, { shapeFromText: vi.fn() }) };
});

import confetti from 'canvas-confetti';
import { fireConfetti } from '@/components/effects/Confetti';
import { Typewriter } from '@/components/effects/Typewriter';
import { Annotate } from '@/components/effects/Annotate';
import { TiltCard } from '@/components/effects/TiltCard';
import { GsapReveal } from '@/components/effects/GsapReveal';
import { AutoAnimate } from '@/components/effects/AutoAnimate';
import ParticlesCanvas from '@/components/effects/internal/ParticlesCanvas';
import { gsap, splitWords, SplitText } from '@/lib/gsap';
import * as effects from '@/components/effects';

describe('طبقة المؤثرات (المكتبات المثبتة) جاهزة للاستعمال', () => {
  it('الفهرس يصدّر كل المغلّفات والمكتبات', () => {
    for (const name of [
      'fireConfetti', 'useConfetti', 'ConfettiOnMount',
      'ParticlesBackground', 'LottiePlayer', 'Typewriter', 'Annotate', 'TiltCard',
      'GsapReveal', 'AutoAnimate', 'useAutoAnimate', 'gsap', 'useGSAP', 'splitWords', 'SplitText', 'Flip', 'TextPlugin', 'MotionPathPlugin',
      'prefersReducedMotion',
    ])
      expect(effects, name).toHaveProperty(name);
  });

  it('fireConfetti: burst يطلق مرة واحدة ويعيد دالة إيقاف', () => {
    (confetti as unknown as ReturnType<typeof vi.fn>).mockClear();
    const stop = fireConfetti('burst');
    expect(confetti).toHaveBeenCalledTimes(1);
    expect(typeof stop).toBe('function');
    stop();
  });

  it('fireConfetti: stars يطلق دفعات متتالية ويمرّر ألوان الذهب', () => {
    vi.useFakeTimers();
    (confetti as unknown as ReturnType<typeof vi.fn>).mockClear();
    fireConfetti('stars');
    vi.advanceTimersByTime(500);
    expect(confetti).toHaveBeenCalledTimes(6);
    vi.useRealTimers();
  });

  it('fireConfetti: cannons مستمر ويتوقف بدالة الإيقاف', () => {
    vi.useFakeTimers();
    (confetti as unknown as ReturnType<typeof vi.fn>).mockClear();
    const stop = fireConfetti('cannons', { duration: 1000 });
    vi.advanceTimersByTime(200);
    const calls = (confetti as unknown as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(calls).toBeGreaterThan(0);
    stop();
    vi.advanceTimersByTime(500);
    expect((confetti as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(calls);
    vi.useRealTimers();
  });

  it('GSAP مُهيّأ وإضافاته مسجّلة، وsplitWords لا يقسّم إلى حروف', () => {
    expect(gsap.version).toMatch(/^3\./);
    expect(SplitText).toBeDefined();
    document.body.innerHTML = '<h1 id="t">تصميم نظام معلوماتي</h1>';
    const split = splitWords('#t');
    expect(split.words).toHaveLength(3);
    expect(split.chars).toHaveLength(0);
    expect(document.getElementById('t')?.textContent).toBe('تصميم نظام معلوماتي');
    split.revert();
  });

  it('Typewriter و Annotate و TiltCard و GsapReveal و AutoAnimate تُعرض', () => {
    expect(renderToStaticMarkup(<Typewriter as="h2" text="نص متحرك" />)).toContain('<h2');
    expect(renderToStaticMarkup(<Annotate type="circle">الإشكالية</Annotate>)).toContain('الإشكالية');
    expect(renderToStaticMarkup(<TiltCard><div>بطاقة</div></TiltCard>)).toContain('بطاقة');
    expect(renderToStaticMarkup(<GsapReveal as="ul"><li>أ</li><li>ب</li></GsapReveal>)).toContain('<ul');
    expect(renderToStaticMarkup(<AutoAnimate as="ol"><li>أ</li></AutoAnimate>)).toContain('<ol');
  });

  it('ParticlesBackground تُعرض كطبقة خلفية بلا تفاعل', () => {
    const html = renderToStaticMarkup(<ParticlesCanvas preset="network" />);
    expect(html).toContain('pointer-events-none');
    expect(html).toContain('aria-hidden');
  });
});
