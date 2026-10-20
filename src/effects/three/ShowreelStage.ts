import * as THREE from 'three';
import { MorphBlob } from './MorphBlob';
import { ParticleField } from './ParticleField';
import { BeatClock, SHOWREEL_LOOP_DURATION, shotAt, transitionIntensity } from '../beat';

/**
 * مسرح الشورييل ثلاثي الأبعاد — Three.js
 * حلقة أشكال عائمة (MeshStandardMaterial معدني) + MorphBlob مركزي + حقل جسيمات
 * + أرضية تستقبل الظلال + إضاءة ثلاثية + كاميرا مدارية يقودها خط زمني للمقاطع
 * النبضات (BeatClock) تضرب الكاميرا والجسيمات والتوهج — والمقاطع تُقص بانتقالات ديناميكية
 */
export interface StageEffects {
  glitch: boolean;
  bloom: boolean;
  grain: boolean;
  rgbShift: boolean;
  vignette: boolean;
}

export const DEFAULT_STAGE_EFFECTS: StageEffects = {
  glitch: true,
  bloom: true,
  grain: true,
  rgbShift: true,
  vignette: true,
};

export class ShowreelStage {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly blob: MorphBlob;
  readonly particles: ParticleField;
  readonly beat: BeatClock;

  effects: StageEffects = { ...DEFAULT_STAGE_EFFECTS };
  /** شدة الانتقال اللحظية 0..1 (للغرافيك العلوي) */
  lastTransition = 0;

  private shapes: THREE.Mesh[] = [];
  private shapeGroup = new THREE.Group();
  private ground: THREE.Mesh;
  private keyLight: THREE.DirectionalLight;
  private accentLight: THREE.PointLight;
  private timer = new THREE.Timer();
  private orbitAngle = 0;
  private mouseX = 0;
  private mouseY = 0;
  private disposables: Array<{ dispose(): void }> = [];

  constructor(bpm = 128) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617);
    this.scene.fog = new THREE.FogExp2(0x020617, 0.035);

    this.camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 100);
    this.camera.position.set(0, 2, 7);

    // ── الإضاءة: رئيسية بظلال + هالة + لمسة لونية ──
    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.5);
    this.scene.add(hemi);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    this.keyLight.position.set(4, 7, 4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.keyLight.shadow.camera.near = 1;
    this.keyLight.shadow.camera.far = 24;
    this.keyLight.shadow.camera.left = -8;
    this.keyLight.shadow.camera.right = 8;
    this.keyLight.shadow.camera.top = 8;
    this.keyLight.shadow.camera.bottom = -8;
    this.scene.add(this.keyLight);

    this.accentLight = new THREE.PointLight(0xfbbf24, 18, 14);
    this.accentLight.position.set(-3, 3, -2);
    this.scene.add(this.accentLight);

    // ── الأرضية: تستقبل الظلال فقط (ShadowMaterial شفافة) ──
    const groundGeo = new THREE.CircleGeometry(14, 48);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
    this.disposables.push(groundGeo, groundMat);

    // ── حلقة الأشكال العائمة ──
    const geos: THREE.BufferGeometry[] = [
      new THREE.TorusKnotGeometry(0.42, 0.15, 96, 16),
      new THREE.IcosahedronGeometry(0.55, 0),
      new THREE.OctahedronGeometry(0.55, 0),
      new THREE.TorusGeometry(0.42, 0.16, 24, 48),
      new THREE.DodecahedronGeometry(0.52, 0),
      new THREE.ConeGeometry(0.42, 0.8, 4),
    ];
    const accents = [0xfbbf24, 0x38bdf8, 0xa78bfa, 0xfb7185, 0x34d399, 0xf472b6];
    geos.forEach((geo, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        metalness: 0.75,
        roughness: 0.22,
        emissive: accents[i],
        emissiveIntensity: 0.12,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      const angle = (i / geos.length) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 3.2, 1.1 + (i % 3) * 0.55, Math.sin(angle) * 3.2);
      mesh.userData['floatPhase'] = i * 1.1;
      this.shapeGroup.add(mesh);
      this.shapes.push(mesh);
      this.disposables.push(geo, mat);
    });
    this.scene.add(this.shapeGroup);

    // ── المركز المتحوّل + الجسيمات ──
    this.blob = new MorphBlob();
    this.scene.add(this.blob.mesh);
    this.particles = new ParticleField(1400);
    this.scene.add(this.particles.points);

    this.beat = new BeatClock(bpm);
  }

  /** إسقاط المؤشر normalized -1..1 لبارالاكس الكاميرا */
  setPointer(x: number, y: number): void {
    this.mouseX = x;
    this.mouseY = y;
  }

  setBpm(bpm: number): void {
    this.beat.bpm = bpm;
  }

  private onBeatPulse(intensity: number): void {
    // نبضة جسيمات من مركز المجسّم + توهج اللون اللامع
    this.particles.burst(this.blob.mesh.position, 26 + Math.floor(intensity * 26), 3.2 + intensity * 2.5);
    this.accentLight.intensity = 18 + intensity * 22;
  }

  /** إيقاف/تشغيل الإيقاع — يُدار من المكوّن */
  play(): void {
    if (!this.beat.running) this.beat.start(this.timer.getElapsed());
  }

  pause(): void {
    this.beat.stop();
  }

  /** حلقة التحديث — ترجع معلومات الزمن للمكوّن (شارة/شوت/سينما) */
  update(): { time: number; dt: number; loopTime: number } {
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.05);
    const time = this.timer.getElapsed();
    const loopTime = time % SHOWREEL_LOOP_DURATION;

    this.beat.update(time, (e) => this.onBeatPulse(e.intensity));

    // ── الكاميرا: مقطع ← معاملات مدارية + بارالاكس مؤشر + نبضة ──
    const shot = shotAt(loopTime);
    const beatEnv = this.beat.envAt(time);
    const punch = 1 - beatEnv * 0.06;
    this.orbitAngle += shot.orbitSpeed * dt;
    const targetR = shot.radius * punch;
    const px = this.mouseX * 0.7;
    const py = this.mouseY * 0.4;
    this.camera.position.set(
      Math.cos(this.orbitAngle) * targetR + px,
      shot.height + py + Math.sin(time * 0.5) * 0.15,
      Math.sin(this.orbitAngle) * targetR,
    );
    const look = new THREE.Vector3(0, 1.2, 0);
    this.camera.lookAt(look);

    // ── الانتقال الديناميكي بين المقاطع: غليتش + وميض يتصاعدان عند القص ──
    this.lastTransition = transitionIntensity(loopTime);
    this.transitionEnv = this.lastTransition;

    // ── تحديث الممثلين ──
    this.blob.update(time, dt);
    this.particles.update(dt);
    this.accentLight.intensity += (18 - this.accentLight.intensity) * dt * 2.5;

    // أشكال تطفو وتدور — إبراز حسب المقطع
    const ringDim = shot.emphasis === 'ring' || shot.emphasis === 'all' ? 1 : 0.35;
    this.shapes.forEach((mesh, i) => {
      const phase = mesh.userData['floatPhase'] as number;
      mesh.position.y = 1.1 + (i % 3) * 0.55 + Math.sin(time * 0.9 + phase) * 0.28;
      mesh.rotation.x += dt * 0.25 * ringDim;
      mesh.rotation.y += dt * 0.4 * ringDim;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.1 + beatEnv * 0.5 + (shot.emphasis === 'ring' ? 0.15 : 0);
    });

    // الجسيمات أكثر كثافة في مقطع العاصفة
    if (shot.emphasis === 'particles' && Math.random() < dt * 6) {
      this.particles.burst(this.blob.mesh.position, 18, 5);
    }

    return { time, dt, loopTime };
  }

  /** بيئة الانتقال الحالية — يستعملها المكوّن لضبط الغليتش */
  transitionEnv = 0;

  dispose(): void {
    this.beat.stop();
    this.blob.dispose();
    this.particles.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
