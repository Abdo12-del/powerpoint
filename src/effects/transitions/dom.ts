import gsap from 'gsap';

/**
 * انتقالات DOM ديناميكية — تُستعمل لتبديل البطاقات في المختبر والمشاهد
 * ثلاثة أنماط: انزلاق Slide / تكبير Zoom / غليتش Glitch
 */

export type DomTransitionStyle = 'slide' | 'zoom' | 'glitch';

/** إدخال عنصر بأسلوب انزلاقي */
export function slideIn(el: HTMLElement, dir: 1 | -1 = 1, duration = 0.55): void {
  gsap.fromTo(
    el,
    { xPercent: 60 * dir, opacity: 0, filter: 'blur(6px)' },
    { xPercent: 0, opacity: 1, filter: 'blur(0px)', duration, ease: 'power3.out' },
  );
}

/** إدخال عنصر بتكبير فراغي */
export function zoomIn(el: HTMLElement, duration = 0.55): void {
  gsap.fromTo(
    el,
    { scale: 1.35, opacity: 0, filter: 'blur(8px)' },
    { scale: 1, opacity: 1, filter: 'blur(0px)', duration, ease: 'power3.inOut' },
  );
}

/** إدخال عنصر بغليتش رقمي — قصات clip سريعة ثم استقرار */
export function glitchIn(el: HTMLElement, duration = 0.5): void {
  const tl = gsap.timeline();
  tl.set(el, { opacity: 1 })
    .fromTo(
      el,
      { clipPath: 'inset(0% 0% 100% 0%)', x: -14, skewX: 12 },
      { clipPath: 'inset(0% 0% 0% 0%)', x: 0, skewX: 0, duration: duration * 0.5, ease: 'steps(6)' },
    )
    .to(el, { x: 6, duration: 0.05, repeat: 3, yoyo: true, ease: 'none' })
    .to(el, { x: 0, duration: 0.08 });
}

/** تبديل محتوى حاوية بأسلوب مختار — يخفي القديم ويعرض الجديد */
export function transitionSwap(
  container: HTMLElement,
  render: () => void,
  style: DomTransitionStyle = 'slide',
): void {
  const out =
    style === 'zoom'
      ? { scale: 0.82, opacity: 0, duration: 0.22, ease: 'power2.in' as const }
      : style === 'glitch'
        ? { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0, duration: 0.18, ease: 'steps(4)' as const }
        : { xPercent: -40, opacity: 0, duration: 0.22, ease: 'power2.in' as const };

  gsap.to(container, {
    ...out,
    onComplete: () => {
      render();
      gsap.set(container, { clearProps: 'clipPath' });
      if (style === 'zoom') zoomIn(container);
      else if (style === 'glitch') glitchIn(container);
      else slideIn(container);
    },
  });
}
