/**
 * حزمة المؤثرات السينمائية — Cinematic Effects & Visual Transitions
 * Three.js (MIT) + Lenis (MIT) + GSAP
 */

// المشهد والشورييل
export { ThreeShowreel } from './ThreeShowreel';
export type { ThreeShowreelHandle, ThreeShowreelProps } from './ThreeShowreel';
export { ShowreelStage, DEFAULT_STAGE_EFFECTS } from './three/ShowreelStage';
export type { StageEffects } from './three/ShowreelStage';

// عناصر ثلاثية الأبعاد
export { useThreeScene } from './three/useThreeScene';
export { ThreeCanvas } from './three/ThreeCanvas';
export type { ThreeCanvasHandle, ThreeCanvasProps } from './three/ThreeCanvas';
export { MorphBlob } from './three/MorphBlob';
export { ParticleField } from './three/ParticleField';
export { createGlitchQuad, updateGlitchQuad } from './three/GlitchQuad';

// المواد والتشوهات البصرية
export { CinemaPass } from './materials/CinemaPass';
export { CinemaShader, MorphMaterialShader, GlitchQuadShader } from './materials/shaders';

// الإيقاع وخط الزمن
export { BeatClock, shotAt, transitionIntensity, smoothstep, SHOWREEL_SHOTS, SHOWREEL_LOOP_DURATION } from './beat';
export type { BeatEvent, Shot } from './beat';

// Lenis — الحركة الانسيابية
export { useLenis, useLenisScroll, LenisProvider } from './lenis';
export type { UseLenisOptions } from './lenis';

// انتقالات DOM
export { slideIn, zoomIn, glitchIn, transitionSwap } from './transitions/dom';
export type { DomTransitionStyle } from './transitions/dom';

// أدوات
export { isWebGLAvailable } from './webgl';
