import * as THREE from 'three';
import { MorphMaterialShader } from '../materials/shaders';

/**
 * المجسّم المتحوّل — Morphing
 * Icosahedron عالي التفاصيل بمادة Shader: إزاحة ضوضائية تتنفس + Fresnel rim
 * uMorph يتحرك 0↔1 ببطء (سينا) ليبدو التحول مستمراً
 */
export class MorphBlob {
  readonly mesh: THREE.Mesh;
  readonly material: THREE.ShaderMaterial;
  private speed = 0.25;

  constructor(detail = 5) {
    const geometry = new THREE.IcosahedronGeometry(1, detail);
    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(MorphMaterialShader.uniforms as never),
      vertexShader: MorphMaterialShader.vertexShader,
      fragmentShader: MorphMaterialShader.fragmentShader,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(0, 1.35, 0);
  }

  /** سرعة التحول 0..1 */
  setSpeed(s: number): void {
    this.speed = Math.max(0.05, Math.min(1, s));
  }

  /** نبضة تحوّل قصيرة عند الإيقاع */
  beat(): void {
    const u = this.uniforms['uMorph'];
    u.value = ((u.value as number) + 0.18) % 1;
  }

  get uniforms(): Record<string, { value: unknown }> {
    return this.material.uniforms as unknown as Record<string, { value: unknown }>;
  }

  update(time: number, dt: number): void {
    this.uniforms['uTime'].value = time;
    // تحول مستمر سينا + دفعة السرعة
    this.uniforms['uMorph'].value =
      (this.uniforms['uMorph'].value as number) * 0.0 +
      0.5 +
      0.5 * Math.sin(time * this.speed * 2.0);
    this.mesh.rotation.y += dt * 0.35;
    this.mesh.rotation.x = Math.sin(time * 0.4) * 0.18;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
