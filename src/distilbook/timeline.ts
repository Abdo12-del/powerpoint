/**
 * الخط الزمني الرئيسي لحزمة Distilbook — GSAP Master Timeline
 *
 * فلسفة Motion Canvas: خط زمني حتمي واحد يملك كل الكوريغرافيا —
 * كل مشهد طبقة ثابتة ماركب (بلا useEffect حركة)، والزمن يرسم كل شيء.
 * النتيجة: Seek حرفي بالسحب، تكرار حلقي، واختبارات مستقرة.
 *
 * الانتقالات: Slide (من اليسار — اتجاه القراءة العربية) / Zoom / Glitch
 * التزامن: نبضات [data-beat] وstagger محسوبة من BPM
 */

import gsap from 'gsap';
import {
  DISTILBOOK_SCENES,
  DISTILBOOK_DURATION,
} from './types';
import type { DistilbookConfig, DistilbookSceneSpec } from './types';

export interface BuildDistilbookTimelineOptions {
  config: DistilbookConfig;
  loop: boolean;
  onTime?: (time: number) => void;
}

export interface DistilbookTimelineHandle {
  tl: gsap.core.Timeline;
  duration: number;
  destroy: () => void;
}

const D = DISTILBOOK_DURATION;

/** حركة دخول المشهد حسب نوع الانتقال */
function entrance(tl: gsap.core.Timeline, spec: DistilbookSceneSpec, el: HTMLElement): void {
  const t = spec.start;
  tl.set(el, { zIndex: 2 }, t);
  switch (spec.transition) {
    case 'slide':
      // من اليسار — اتجاه تقدّم القراءة العربية
      tl.fromTo(
        el,
        { xPercent: -70, autoAlpha: 0, filter: 'blur(8px)' },
        { xPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
        t,
      );
      break;
    case 'zoom':
      tl.fromTo(
        el,
        { scale: 1.38, autoAlpha: 0, filter: 'blur(10px)' },
        { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.inOut' },
        t,
      );
      break;
    case 'glitch':
      tl.set(el, { autoAlpha: 1 }, t)
        .fromTo(
          el,
          { clipPath: 'inset(0% 0% 100% 0%)', x: -18, skewX: 10 },
          { clipPath: 'inset(0% 0% 0% 0%)', x: 0, skewX: 0, duration: 0.3, ease: 'steps(5)' },
          t,
        )
        .to(el, { x: 8, duration: 0.05, repeat: 3, yoyo: true, ease: 'none' }, t + 0.3)
        .to(el, { x: 0, duration: 0.08 }, t + 0.52);
      break;
  }
}

/** خروج موحّد هادئ قبل المشهد التالي */
function exit(tl: gsap.core.Timeline, spec: DistilbookSceneSpec, el: HTMLElement): void {
  const t = spec.end - 0.26;
  tl.set(el, { zIndex: 1 }, t)
    .to(el, { autoAlpha: 0, scale: 0.94, filter: 'blur(6px)', duration: 0.24, ease: 'power2.in' }, t);
}

/** نبضات إيقاعية على عناصر [data-beat] داخل مشهد — كل نبضة قفزة صغيرة yoyo */
function addBeats(tl: gsap.core.Timeline, scope: HTMLElement, from: number, to: number, beat: number): void {
  const targets = scope.querySelectorAll<HTMLElement>('[data-beat]');
  if (!targets.length) return;
  const n = Math.max(0, Math.floor((to - from) / beat));
  for (let i = 0; i < n; i++) {
    tl.to(
      targets,
      { scale: 1.04, duration: beat * 0.3, yoyo: true, repeat: 1, ease: 'power2.out' },
      from + i * beat,
    );
  }
}

/** شرارات تنطلق من المركز إلى إزاحات data-dx/data-dy */
function sparks(tl: gsap.core.Timeline, scope: HTMLElement, t: number): void {
  const els = Array.from(scope.querySelectorAll<HTMLElement>('[data-spark]'));
  if (!els.length) return;
  const dx = els.map((s) => Number(s.dataset['dx'] ?? 0));
  const dy = els.map((s) => Number(s.dataset['dy'] ?? 0));
  tl.fromTo(
    els,
    { x: 0, y: 0, autoAlpha: 1, scale: 0.3 },
    { x: (i) => dx[i], y: (i) => dy[i], autoAlpha: 0, scale: 1.1, duration: 0.9, ease: 'power3.out' },
    t,
  );
}

/**
 * بناء الخط الزمني الرئيسي — يُستدعى بعد تركيب المشاهد في DOM
 */
export function buildDistilbookTimeline(
  root: HTMLElement,
  options: BuildDistilbookTimelineOptions,
): DistilbookTimelineHandle {
  const { config, loop, onTime } = options;
  const beat = 60 / config.bpm;

  const tl = gsap.timeline({
    paused: true,
    repeat: loop ? -1 : 0,
    onUpdate: () => onTime?.(tl.time()),
  });

  const sceneEls = new Map<string, HTMLElement>();
  DISTILBOOK_SCENES.forEach((spec) => {
    const el = root.querySelector<HTMLElement>(`[data-scene="${spec.id}"]`);
    if (el) sceneEls.set(spec.id, el);
  });

  // الإخفاء الابتدائي لكل الطبقات ثم جدولة دخول كل مشهد بانتقاله
  gsap.set(Array.from(sceneEls.values()), { autoAlpha: 0 });
  DISTILBOOK_SCENES.forEach((spec) => {
    const el = sceneEls.get(spec.id);
    if (el) entrance(tl, spec, el);
  });

  // ─── 1) الافتتاح: حروف العلامة تصعد + شرارات + وعد القيمة ───
  const opening = sceneEls.get('opening');
  if (opening) {
    const letters = opening.querySelectorAll<HTMLElement>('[data-letter]');
    tl.fromTo(
      letters,
      { y: 64, rotationX: -70, autoAlpha: 0 },
      { y: 0, rotationX: 0, autoAlpha: 1, duration: 0.55, stagger: 0.06, ease: 'back.out(1.7)' },
      0.15,
    );
    tl.fromTo(
      opening.querySelectorAll<HTMLElement>('[data-tag], [data-tagline]'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' },
      0.9,
    );
    sparks(tl, opening, 0.35);
    addBeats(tl, opening, 1.2, 2.55, beat);
  }

  // ─── 2) المشكلة: صفحات تتكدس بسرعة مقلقة + عدّاد + رجّة نهائية ───
  const problem = sceneEls.get('problem');
  if (problem) {
    const pages = problem.querySelectorAll<HTMLElement>('[data-page]');
    tl.fromTo(
      pages,
      { y: -150, rotation: () => gsap.utils.random(-16, 16), autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.34, stagger: { each: 0.085, from: 'start' }, ease: 'power3.out' },
      2.7,
    );
    tl.fromTo(
      problem.querySelectorAll<HTMLElement>('[data-count]'),
      { scale: 0, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2.2)' },
      3.6,
    );
    addBeats(tl, problem, 3.6, 5.0, beat);
    // رجّة إغراق عند نهاية المشهد
    tl.to(problem, { x: 7, duration: 0.045, repeat: 7, yoyo: true, ease: 'none' }, 5.0)
      .to(problem, { x: 0, duration: 0.06 }, 5.36);
  }

  // ─── 3) التقطير: مشهد ثلاثي الأبعاد + مقياس النقاء وخطوات ───
  const distill = sceneEls.get('distill');
  if (distill) {
    tl.fromTo(
      distill.querySelectorAll<HTMLElement>('[data-caption]'),
      { y: 26, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' },
      6.0,
    );
    // مقياس النقاء يمتلئ عبر المشهد كله
    tl.fromTo(
      distill.querySelectorAll<HTMLElement>('[data-purity]'),
      { scaleX: 0 },
      { scaleX: 1, duration: 3.0, ease: 'power1.inOut' },
      6.1,
    );
    tl.fromTo(
      distill.querySelectorAll<HTMLElement>('[data-step]'),
      { scale: 0, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.75, ease: 'back.out(1.8)' },
      6.2,
    );
    addBeats(tl, distill, 6.4, 9.0, beat);
  }

  // ─── 4) الأفكار: كتابة حركية — عنوان ثم شرائح تظهر مع النبضات ───
  const ideas = sceneEls.get('ideas');
  if (ideas) {
    tl.fromTo(
      ideas.querySelectorAll<HTMLElement>('[data-word]'),
      { y: 46, autoAlpha: 0, scale: 0.85 },
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.09, ease: 'back.out(1.6)' },
      9.3,
    );
    tl.fromTo(
      ideas.querySelectorAll<HTMLElement>('[data-underline]'),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: 'power2.inOut' },
      9.8,
    );
    tl.fromTo(
      ideas.querySelectorAll<HTMLElement>('[data-idea]'),
      { scale: 0, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.5, stagger: beat * 0.5, ease: 'elastic.out(1, 0.55)' },
      10.0,
    );
    addBeats(tl, ideas, 10.2, 12.1, beat);
  }

  // ─── 5) المراجع: عقد تنبض بالظهور ووصلات تُرسم ───
  const references = sceneEls.get('references');
  if (references) {
    tl.fromTo(
      references.querySelectorAll<HTMLElement>('[data-edge]'),
      { attr: { 'stroke-dashoffset': 1 } },
      { attr: { 'stroke-dashoffset': 0 }, duration: 0.55, stagger: 0.08, ease: 'power2.inOut' },
      12.4,
    );
    const circles = Array.from(references.querySelectorAll<SVGCircleElement>('[data-ref-circle]'));
    const radii = circles.map((c) => Number(c.getAttribute('data-r') ?? 10));
    tl.fromTo(
      circles,
      { attr: { r: 0 } },
      { attr: { r: (i: number) => radii[i] }, duration: 0.5, stagger: 0.1, ease: 'back.out(2)' },
      12.5,
    );
    tl.to(
      references.querySelectorAll<HTMLElement>('[data-ref-node]'),
      { autoAlpha: 1, duration: 0.3, stagger: 0.1 },
      12.5,
    );
    tl.fromTo(
      references.querySelectorAll<HTMLElement>('[data-ref-chip]'),
      { y: 18, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' },
      13.4,
    );
    addBeats(tl, references, 13.0, 14.5, beat);
  }

  // ─── 6) الملخصات: ثلاث بطاقات بثلاثة انتقالات سينمائية ───
  const summary = sceneEls.get('summary');
  if (summary) {
    const cards = summary.querySelectorAll<HTMLElement>('[data-card]');
    if (cards[0]) tl.fromTo(cards[0], { xPercent: -60, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out' }, 14.75);
    if (cards[1]) tl.fromTo(cards[1], { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.55, ease: 'power3.inOut' }, 15.15);
    if (cards[2]) tl.fromTo(cards[2], { xPercent: 60, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out' }, 15.55);
    tl.fromTo(
      summary.querySelectorAll<HTMLElement>('[data-point]'),
      { x: 26, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.35, stagger: 0.12, ease: 'power2.out' },
      15.9,
    );
    tl.fromTo(
      summary.querySelectorAll<HTMLElement>('[data-src]'),
      { scale: 0 },
      { scale: 1, duration: 0.4, stagger: 0.14, ease: 'back.out(2)' },
      16.2,
    );
    addBeats(tl, summary, 16.0, 17.3, beat);
  }

  // ─── 7) الختام: العلامة + الوعد + أرقام القيمة + دعوة ───
  const finale = sceneEls.get('finale');
  if (finale) {
    tl.fromTo(
      finale.querySelectorAll<HTMLElement>('[data-finale-brand]'),
      { scale: 0.7, autoAlpha: 0, filter: 'blur(12px)' },
      { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
      17.55,
    );
    tl.fromTo(
      finale.querySelectorAll<HTMLElement>('[data-stat]'),
      { scale: 0, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.5, stagger: beat * 0.5, ease: 'elastic.out(1, 0.6)' },
      18.1,
    );
    tl.fromTo(
      finale.querySelectorAll<HTMLElement>('[data-cta]'),
      { y: 30, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.6)' },
      18.9,
    );
    sparks(tl, finale, 17.7);
    addBeats(tl, finale, 18.2, 19.9, beat);
    // خروج سريع قبل لفّ الحلقة
    tl.to(finale, { autoAlpha: 0, duration: 0.16, ease: 'power1.in' }, D - 0.16);
  }

  // المخارج الموحّدة لبقية المشاهد
  DISTILBOOK_SCENES.forEach((spec) => {
    if (spec.id === 'finale') return;
    const el = sceneEls.get(spec.id);
    if (el) exit(tl, spec, el);
  });

  return {
    tl,
    duration: D,
    destroy: () => {
      tl.kill();
      gsap.set(Array.from(sceneEls.values()), { clearProps: 'all' });
    },
  };
}
