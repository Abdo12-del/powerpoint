/**
 * نظام الجسيمات — Particle Effects متزامن مع الإيقاع
 * Canvas2D خفيف بدون مكتبات خارجية (بديل tsParticles للـ showreel)
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private running = false;
  private beatIntensity = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('لا يمكن إنشاء سياق Canvas للجسيمات');
    this.ctx = ctx;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** نبضة إيقاعية — تضخم الانفجار */
  pulse(intensity = 1) {
    this.beatIntensity = intensity;
    this.burst(18 + Math.floor(intensity * 22));
  }

  burst(count = 24) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const colors = ['#fbbf24', '#38bdf8', '#a78bfa', '#fb7185', '#34d399', '#f472b6'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
      const speed = 2 + Math.random() * 6 + this.beatIntensity * 3;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        size: 2 + Math.random() * 5,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
      });
    }
  }

  emit(x: number, y: number, color = '#fbbf24', count = 1) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        size: 1.5 + Math.random() * 3.5,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.5,
        color,
        alpha: 1,
      });
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    let last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  private update(dt: number) {
    this.beatIntensity *= 0.92; // تلاشي النبضة

    for (const p of this.particles) {
      p.life += dt;
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.vy += 18 * dt; // جاذبية
      p.vx *= 0.995;
      p.alpha = 1 - p.life / p.maxLife;
      // توهج إضافي مع النبضة
      p.size *= 0.998;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife && p.alpha > 0.01);
  }

  private draw() {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);

    for (const p of this.particles) {
      this.ctx.globalAlpha = p.alpha * 0.9;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;
  }

  dispose() {
    this.stop();
  }
}
