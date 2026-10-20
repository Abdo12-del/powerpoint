import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { CinemaShader } from './shaders';

/**
 * المرور السينمائي — يُضاف كآخر مرور في EffectComposer
 * واجهة سهلة لضبط الغليتش/الانزياح/الحبيبات/الفينييت/النبضة
 */
export class CinemaPass extends ShaderPass {
  constructor() {
    super(CinemaShader);
  }

  setTime(t: number): void {
    this.uniforms['uTime'].value = t;
  }

  /** نبضة إيقاعية — تُستدعى من BeatClock وتتلاشى في الحلقة */
  pulse(strength = 1): void {
    this.uniforms['uPulse'].value = Math.min(1, this.uniforms['uPulse'].value + strength);
  }

  /** اضمحلال النبضة — يُستدعى كل إطار */
  decayPulse(dt: number, speed = 3.2): void {
    const u = this.uniforms['uPulse'];
    u.value = Math.max(0, u.value - dt * speed);
  }

  get glitch(): number {
    return this.uniforms['uGlitch'].value as number;
  }
  set glitch(v: number) {
    this.uniforms['uGlitch'].value = v;
  }

  get rgbShift(): number {
    return this.uniforms['uRgbShift'].value as number;
  }
  set rgbShift(v: number) {
    this.uniforms['uRgbShift'].value = v;
  }

  get grain(): number {
    return this.uniforms['uGrain'].value as number;
  }
  set grain(v: number) {
    this.uniforms['uGrain'].value = v;
  }

  get vignette(): number {
    return this.uniforms['uVignette'].value as number;
  }
  set vignette(v: number) {
    this.uniforms['uVignette'].value = v;
  }
}
