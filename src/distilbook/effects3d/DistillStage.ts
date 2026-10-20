import * as THREE from 'three';
import { MorphBlob } from '@/effects/three/MorphBlob';
import { ParticleField } from '@/effects/three/ParticleField';
import { BeatClock } from '@/effects/beat';

/**
 * مسرح «التقطير» ثلاثي الأبعاد — Distilbook
 * كتلة بحث كثيفة (MorphBlob) تتنفس في المركز، حولها بلورات نقاء تتكثّف،
 * وقطرات معرفة تتساقط مع كل نبضة — والكاميرا تدور ببارالاكس مؤشر.
 * النقاء purity يتقدم مع الزمن: الكتلة تتقلص والبلورات تكبر.
 */
export class DistillStage {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly blob: MorphBlob;
  readonly drops: ParticleField;
  readonly beat: BeatClock;

  private timer = new THREE.Timer();
  private elapsed = 0;
  private ring = new THREE.Group();
  private crystals: THREE.Mesh[] = [];
  private keyLight: THREE.DirectionalLight;
  private accent: THREE.PointLight;
  private orbit = 0;
  private mouseX = 0;
  private mouseY = 0;
  private disposables: Array<{ dispose(): void }> = [];

  /** مدة دورة التقطير الواحدة بالثواني */
  readonly cycle = 3.6;

  constructor(bpm = 124) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617);
    this.scene.fog = new THREE.FogExp2(0x020617, 0.06);

    this.camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 60);
    this.camera.position.set(0, 1.1, 5.4);

    // إضاءة: رئيسية بظلال + لمسة سماوية (لون التقطير)
    this.scene.add(new THREE.HemisphereLight(0x99f6e4, 0x0f172a, 0.55));
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(3.5, 6, 4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.scene.add(this.keyLight);
    this.accent = new THREE.PointLight(0x38bdf8, 16, 12);
    this.accent.position.set(-2.5, 2.5, -2);
    this.scene.add(this.accent);

    // أرضية ظلال
    const groundGeo = new THREE.CircleGeometry(10, 48);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.disposables.push(groundGeo, groundMat);

    // الكتلة الكثيفة (البحث الخام) — تدرّج سماوي/فيروزي
    this.blob = new MorphBlob(5);
    this.blob.uniforms['uColorA'].value = [0.18, 0.83, 0.75]; // teal
    this.blob.uniforms['uColorB'].value = [0.22, 0.74, 0.97]; // sky
    this.blob.mesh.position.set(0, 1.25, 0);
    this.scene.add(this.blob.mesh);

    // بلورات النقاء — حلقة ثمانيات صغيرة تتبلور تدريجياً
    const crystalGeo = new THREE.OctahedronGeometry(0.16, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x99f6e4,
      metalness: 0.6,
      roughness: 0.15,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.5,
    });
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(crystalGeo, crystalMat);
      const a = (i / 8) * Math.PI * 2;
      m.position.set(Math.cos(a) * 1.75, 1.05 + (i % 2) * 0.5, Math.sin(a) * 1.75);
      m.scale.setScalar(0.001);
      m.userData['phase'] = i;
      this.crystals.push(m);
      this.ring.add(m);
    }
    this.scene.add(this.ring);
    this.disposables.push(crystalGeo, crystalMat);

    // قطرات المعرفة المتساقطة
    this.drops = new ParticleField(900, ['#2dd4bf', '#38bdf8', '#99f6e4', '#fbbf24']);
    this.scene.add(this.drops.points);

    this.beat = new BeatClock(bpm);
  }

  setPointer(x: number, y: number): void {
    this.mouseX = x;
    this.mouseY = y;
  }

  setBpm(v: number): void {
    this.beat.bpm = v;
  }

  play(): void {
    if (!this.beat.running) this.beat.start(this.timer.getElapsed());
  }

  pause(): void {
    this.beat.stop();
  }

  /** نبضة: قطرات تتساقط من الكتلة + وهج اللون */
  private onBeat(intensity: number): void {
    this.drops.burst(this.blob.mesh.position, 20 + intensity * 20, 2.6 + intensity * 2);
    this.accent.intensity = 16 + intensity * 20;
  }

  /**
   * تحديث الإطار — يرجع نسبة النقاء 0..1 خلال دورة التقطير
   * dtOverride للتقدّم الحتمي في الاختبارات ومعاينة الإطارات
   */
  update(dtOverride?: number): { purity: number } {
    this.timer.update();
    const dt = dtOverride ?? Math.min(this.timer.getDelta(), 0.05);
    this.elapsed += dt;
    const time = this.elapsed;
    const cycleT = time % this.cycle;
    const purity = cycleT / this.cycle;

    this.beat.update(time, (e) => this.onBeat(e.intensity));
    const beatEnv = this.beat.envAt(time);

    // الكتلة تتقلص كلما نقّى المضمون + نبضة ضوئية
    const shrink = THREE.MathUtils.lerp(1.0, 0.55, purity);
    this.blob.mesh.scale.setScalar(shrink * (1 - beatEnv * 0.05));
    this.blob.update(time, dt);

    // البلورات تتبلور مع النقاء + تطفو وتدور
    this.crystals.forEach((m, i) => {
      const phase = m.userData['phase'] as number;
      const local = THREE.MathUtils.clamp(purity * 8 - phase * 0.5, 0, 1);
      m.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, local));
      m.rotation.y += dt * (0.6 + beatEnv * 2);
      m.position.y = 1.05 + (i % 2) * 0.5 + Math.sin(time * 1.2 + phase) * 0.08;
    });

    this.drops.update(dt);
    this.accent.intensity += (16 - this.accent.intensity) * dt * 2.5;

    // كاميرا مدارية بطيئة + بارالاكس مؤشر + نبضة اقتراب
    this.orbit += dt * 0.28;
    const r = 5.4 * (1 - beatEnv * 0.045);
    this.camera.position.set(
      Math.cos(this.orbit) * r + this.mouseX * 0.6,
      1.1 + this.mouseY * 0.35 + Math.sin(time * 0.5) * 0.12,
      Math.sin(this.orbit) * r,
    );
    this.camera.lookAt(0, 1.15, 0);

    return { purity };
  }

  /** تقدّم زمني حتمي بخطوات ثابتة — للاختبارات ومعاينة الإطارات */
  step(seconds: number): { purity: number } {
    let r = { purity: 0 };
    const n = Math.max(1, Math.ceil(seconds / 0.05));
    for (let i = 0; i < n; i++) r = this.update(0.05);
    return r;
  }

  dispose(): void {
    this.beat.stop();
    this.blob.dispose();
    this.drops.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
