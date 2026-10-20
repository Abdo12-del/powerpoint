/**
 * مخطط GSAP الزمني الرئيسي للـ Showreel — 15 ثانية
 * يزامن كل المشاهد والانتقالات مع الإيقاع (BPM)
 */

import gsap from 'gsap';
import { SHOWREEL_SCENES, SHOWREEL_DURATION } from './types';

export interface TimelineHandle {
  tl: gsap.core.Timeline;
  duration: number;
  getActiveScene: (time: number) => typeof SHOWREEL_SCENES[number] | undefined;
}

/**
 * يبني timeline رئيسي يتحكم بكل المشاهد
 * - انتقالات Slide/Zoom سلسة
 * - تزامن دقيق مع الموسيقى عبر تقسيم الزمن على نبضات BPM
 */
export function buildShowreelTimeline(
  root: HTMLElement,
  onUpdate?: (time: number, sceneId: string) => void,
  bpm = 128,
): TimelineHandle {
  const beat = 60 / bpm; // ثانية لكل نبضة

  const tl = gsap.timeline({
    paused: true,
    onUpdate: () => {
      const t = tl.time();
      const scene = SHOWREEL_SCENES.find((s) => t >= s.start && t < s.end);
      if (scene) onUpdate?.(t, scene.id);
    },
  });

  // إعداد ابتدائي — إخفاء كل المشاهد
  const scenes = root.querySelectorAll<HTMLElement>('[data-scene]');
  gsap.set(scenes, { autoAlpha: 0, y: 30, scale: 0.96, rotationX: 8 });

  SHOWREEL_SCENES.forEach((scene, idx) => {
    const el = root.querySelector<HTMLElement>(`[data-scene="${scene.id}"]`);
    if (!el) return;

    const prevEl = idx > 0 ? root.querySelector<HTMLElement>(`[data-scene="${SHOWREEL_SCENES[idx - 1].id}"]`) : null;

    // انتقال Slide/Zoom للدخول — مزامن مع البيت
    tl.addLabel(scene.id, scene.start);

    // إخفاء السابق بـ slide out
    if (prevEl) {
      tl.to(
        prevEl,
        {
          autoAlpha: 0,
          x: -60,
          scale: 0.92,
          rotationY: -8,
          duration: 0.45,
          ease: 'power3.in',
        },
        scene.start - 0.15,
      );
    }

    // إظهار الحالي بـ slide in + zoom
    tl.fromTo(
      el,
      { autoAlpha: 0, x: 70, scale: 0.9, rotationY: 12, filter: 'blur(8px)' },
      {
        autoAlpha: 1,
        x: 0,
        scale: 1,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 0.55,
        ease: 'power3.out',
      },
      scene.start,
    );

    // حركة داخلية حسب نوع المشهد
    const inner = el.querySelectorAll<HTMLElement>('[data-animate]');
    if (inner.length) {
      // Slide داخلي متتابع
      tl.fromTo(
        inner,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.06, ease: 'power3.out' },
        scene.start + 0.2,
      );
    }

    // نبض مع الإيقاع داخل المشهد — كل نبضة scale خفيف
    const beatsInScene = Math.floor((scene.end - scene.start) / beat);
    for (let b = 1; b < beatsInScene; b++) {
      const bt = scene.start + b * beat;
      if (bt < scene.end - 0.15) {
        tl.to(
          el.querySelector<HTMLElement>('[data-beat]') ?? el,
          { scale: 1.015, duration: 0.08, ease: 'power2.out', yoyo: true, repeat: 1 },
          bt,
        );
      }
    }
  });

  // الخاتمة — zoom out سينمائي
  const finale = root.querySelector<HTMLElement>('[data-scene="finale"]');
  if (finale) {
    tl.to(
      finale,
      { scale: 1.06, duration: 1.2, ease: 'power2.inOut' },
      SHOWREEL_SCENES[SHOWREEL_SCENES.length - 1].start + 0.4,
    );
  }

  tl.duration(SHOWREEL_DURATION);

  return {
    tl,
    duration: SHOWREEL_DURATION,
    getActiveScene: (time: number) => SHOWREEL_SCENES.find((s) => time >= s.start && time < s.end),
  };
}

/**
 * يحسب نبضات الموسيقى المتزامنة مع الزمن
 */
export function getBeatProgress(time: number, bpm: number): number {
  const beat = 60 / bpm;
  return (time % beat) / beat; // 0..1 داخل النبضة
}

export function getBarProgress(time: number, bpm: number): number {
  const bar = (60 / bpm) * 4;
  return (time % bar) / bar;
}
