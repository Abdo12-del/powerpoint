import * as THREE from 'three';

/**
 * حقل الجسيمات — نظام Points خفيف فوق BufferGeometry
 * ألوان لكل جسيم تتلاشى إلى الأسود (يعمل مع AdditiveBlending = شفافية)
 * انفجارات burst() متزامنة مع نبضات BeatClock
 */
export class ParticleField {
  readonly points: THREE.Points;
  readonly count: number;

  private positions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private baseColors: Float32Array;
  private lives: Float32Array;
  private maxLives: Float32Array;
  private geometry: THREE.BufferGeometry;
  private palette: THREE.Color[];

  constructor(count = 1200, palette = ['#fbbf24', '#38bdf8', '#a78bfa', '#fb7185', '#34d399', '#f472b6']) {
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    this.baseColors = new Float32Array(count * 3);
    this.lives = new Float32Array(count);
    this.maxLives = new Float32Array(count);
    this.palette = palette.map((c) => new THREE.Color(c));

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    this.points = new THREE.Points(this.geometry, material);
    this.points.frustumCulled = false;
  }

  /** فهرس جسيم ميت (نُعيد تدوير الجسيمات) */
  private deadIndex(): number {
    for (let i = 0; i < this.count; i++) {
      if (this.lives[i] >= this.maxLives[i]) return i;
    }
    return Math.floor(Math.random() * this.count);
  }

  /** إشعال جسيم واحد من نقطة بسرعة */
  private spawn(i: number, x: number, y: number, z: number, speed: number): void {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const vx = Math.sin(phi) * Math.cos(theta) * speed;
    const vy = Math.abs(Math.cos(phi)) * speed * (0.6 + Math.random() * 0.8);
    const vz = Math.sin(phi) * Math.sin(theta) * speed;

    this.positions[i * 3] = x;
    this.positions[i * 3 + 1] = y;
    this.positions[i * 3 + 2] = z;
    this.velocities[i * 3] = vx;
    this.velocities[i * 3 + 1] = vy;
    this.velocities[i * 3 + 2] = vz;

    const c = this.palette[Math.floor(Math.random() * this.palette.length)];
    this.baseColors[i * 3] = c.r;
    this.baseColors[i * 3 + 1] = c.g;
    this.baseColors[i * 3 + 2] = c.b;

    this.lives[i] = 0;
    this.maxLives[i] = 0.9 + Math.random() * 1.2;
  }

  /** انفجار من نقطة — يُستدعى مع نبضة الإيقاع */
  burst(origin: THREE.Vector3, n = 40, speed = 4): void {
    for (let k = 0; k < n; k++) {
      const i = this.deadIndex();
      this.spawn(
        i,
        origin.x + (Math.random() - 0.5) * 0.6,
        origin.y + (Math.random() - 0.5) * 0.4,
        origin.z + (Math.random() - 0.5) * 0.6,
        speed * (0.4 + Math.random() * 0.9),
      );
    }
  }

  /** تكامل الحركة + جاذبية خفيفة + تلاشي اللون مع العمر */
  update(dt: number): void {
    const gravity = -1.6;
    for (let i = 0; i < this.count; i++) {
      if (this.lives[i] >= this.maxLives[i]) {
        this.colors[i * 3] = 0;
        this.colors[i * 3 + 1] = 0;
        this.colors[i * 3 + 2] = 0;
        continue;
      }
      this.lives[i] += dt;
      const fade = Math.max(0, 1 - this.lives[i] / this.maxLives[i]);
      this.velocities[i * 3 + 1] += gravity * dt;

      this.positions[i * 3] += this.velocities[i * 3] * dt;
      this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * dt;
      this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * dt;

      this.colors[i * 3] = this.baseColors[i * 3] * fade;
      this.colors[i * 3 + 1] = this.baseColors[i * 3 + 1] * fade;
      this.colors[i * 3 + 2] = this.baseColors[i * 3 + 2] * fade;
    }
    this.geometry.attributes['position'].needsUpdate = true;
    this.geometry.attributes['color'].needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}
