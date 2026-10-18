// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as gallery from '@/components/gallery';
import {
  AnimatedBeam, AnimatedCircularProgressBar, AnimatedGradientText, AnimatedGridPattern, AnimatedList, AnimatedShinyText,
  AuroraText, AvatarCircles, BlurFade, BorderBeam, DotPattern, FlickeringGrid, GlowEffect, GridPattern,
  ImageComparison, ImageComparisonImage, ImageComparisonSlider, Iphone, MagicCard, Marquee, Meteors, NeonGradientCard,
  NumberTicker, OrbitingCircles, Ripple, Safari, ShimmerButton, ShineBorder, SparklesText, Terminal, TypingAnimation,
  AnimatedSpan, TextAnimate, TransitionPanel, WarpBackground, WordRotate,
} from '@/components/gallery';

const r = (el: React.ReactElement) => renderToStaticMarkup(el);

// jsdom بلا canvas: نمنع رسالة "Not implemented: getContext" من FlickeringGrid
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: () => null, configurable: true });

describe('معرض المكونات المستعارة (Magic UI / motion-primitives) يُعرض بلا أخطاء', () => {
  it('الفهرس يصدّر 37 مكوّناً', () => {
    expect(Object.keys(gallery).length).toBe(37);
  });

  it('مكونات النصوص', () => {
    expect(r(<TextAnimate animation="blurInUp" by="word">نظام معلوماتي لتسيير المخزون</TextAnimate>)).toContain('المخزون');
    expect(r(<WordRotate words={['سريع', 'موثوق']} />)).toContain('سريع');
    expect(r(<BlurFade delay={0.2}><p>فقرة</p></BlurFade>)).toContain('فقرة');
    expect(r(<AnimatedShinyText>جديد</AnimatedShinyText>)).toContain('animate-shiny-text');
    expect(r(<AnimatedGradientText>تدرّج</AnimatedGradientText>)).toContain('animate-gradient');
    expect(r(<AuroraText>شفق</AuroraText>)).toContain('شفق');
    expect(r(<SparklesText>بريق</SparklesText>)).toContain('بريق');
  });

  it('TextAnimate لا يفصل الحروف العربية حتى لو طُلب by="character" (قاعدة §9.5)', () => {
    const arabic = r(<TextAnimate by="character" accessible={false}>تصميم نظام</TextAnimate>);
    expect(arabic).toContain('>تصميم<');
    expect(arabic).not.toContain('>ت<');
    const latin = r(<TextAnimate by="character" accessible={false}>ab</TextAnimate>);
    expect(latin).toContain('>a<');
  });

  it('الأرقام والمؤشرات', () => {
    expect(r(<NumberTicker value={1250} />)).toContain('<span');
    expect(r(<AnimatedCircularProgressBar value={72} gaugePrimaryColor="#fbbf24" gaugeSecondaryColor="rgba(255,255,255,.1)" />)).toContain('72');
  });

  it('المخططات والعلاقات', () => {
    const c = createRef<HTMLDivElement>();
    const a = createRef<HTMLDivElement>();
    const b = createRef<HTMLDivElement>();
    expect(r(<div ref={c}><div ref={a} /><div ref={b} /><AnimatedBeam containerRef={c} fromRef={a} toRef={b} /></div>)).toContain('<svg');
    expect(r(<OrbitingCircles radius={80}><span>أ</span><span>ب</span></OrbitingCircles>)).toContain('animate-orbit');
    expect(r(<AnimatedList delay={500}><div>1</div><div>2</div></AnimatedList>)).toContain('<div');
    expect(r(<Marquee><span>شعار</span></Marquee>)).toContain('dir="ltr"');
    expect(r(<TransitionPanel activeIndex={0}>{[<p key="a">أ</p>, <p key="b">ب</p>]}</TransitionPanel>)).toContain('أ');
    expect(
      r(
        <ImageComparison className="h-40">
          <ImageComparisonImage src="/a.png" alt="قبل" position="left" />
          <ImageComparisonImage src="/b.png" alt="بعد" position="right" />
          <ImageComparisonSlider className="bg-white" />
        </ImageComparison>,
      ),
    ).toContain('قبل');
  });

  it('البطاقات والإطارات', () => {
    expect(r(<div className="relative"><BorderBeam /></div>)).toContain('<div');
    expect(r(<div className="relative"><ShineBorder /></div>)).toContain('animate-shine');
    expect(r(<MagicCard><p>بطاقة</p></MagicCard>)).toContain('بطاقة');
    expect(r(<NeonGradientCard><p>نيون</p></NeonGradientCard>)).toContain('نيون');
    expect(r(<div className="relative"><GlowEffect mode="pulse" /></div>)).toContain('pointer-events-none');
    expect(r(<ShimmerButton>ابدأ</ShimmerButton>)).toContain('ابدأ');
  });

  it('الخلفيات', () => {
    expect(() => r(<Meteors number={5} />)).not.toThrow(); // الشهب تُولَّد في useEffect (تحتاج window.innerWidth)
    expect(r(<Ripple />)).toContain('animate-ripple');
    expect(r(<DotPattern />)).toContain('<svg');
    expect(r(<GridPattern />)).toContain('<svg');
    expect(r(<AnimatedGridPattern numSquares={4} />)).toContain('<svg');
    expect(r(<FlickeringGrid />)).toContain('<canvas');
    expect(r(<WarpBackground><p>محتوى</p></WarpBackground>)).toContain('محتوى');
  });

  it('الكود والأجهزة والأشخاص', () => {
    expect(
      r(
        <Terminal>
          <TypingAnimation>npm run check</TypingAnimation>
          <AnimatedSpan>✔ 49 tests</AnimatedSpan>
        </Terminal>,
      ),
    ).toContain('<pre');
    expect(r(<Safari url="example.dz" />)).toContain('<svg');
    expect(r(<Iphone />)).toContain('<svg');
    expect(r(<AvatarCircles numPeople={3} avatarUrls={[{ imageUrl: '/a.png', profileUrl: '#' }]} />)).toContain('+3');
  });
});
