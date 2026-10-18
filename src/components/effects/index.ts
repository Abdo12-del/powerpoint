/**
 * طبقة المؤثرات الجاهزة — كل مكتبة حركة مثبتة لها مغلّف بسيط هنا.
 * الكتالوج الكامل مع أمثلة: docs/ANIMATION_LIBRARIES.md
 */
export { fireConfetti, useConfetti, ConfettiOnMount, confetti, type ConfettiPreset, type ConfettiOptions } from './Confetti';
export { ParticlesBackground, type ParticlesPreset, type ParticlesBackgroundProps } from './ParticlesBackground';
export { LottiePlayer, type LottiePlayerProps } from './LottiePlayer';
export { Typewriter, type TypewriterProps } from './Typewriter';
export { Annotate, type AnnotateProps } from './Annotate';
export { TiltCard, type TiltCardProps } from './TiltCard';
export { GsapReveal, type GsapRevealProps } from './GsapReveal';
export { AutoAnimate, useAutoAnimate, type AutoAnimateProps } from './AutoAnimate';
export { gsap, useGSAP, splitWords, SplitText, Flip, TextPlugin, MotionPathPlugin } from '@/lib/gsap';
export { prefersReducedMotion } from '@/lib/motion-prefs';
