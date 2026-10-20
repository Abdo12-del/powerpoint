/**
 * مسار الكاميرا المتحركة باستمرار — Catmull-Rom spline + تحكم دقيق في السرعة والعمق
 */

import type { FlyoverConfig } from './legacy-types';

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  roll: number;
  fov: number;
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number) {
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

function catmullRomVec3(
  p0: [number, number, number],
  p1: [number, number, number],
  p2: [number, number, number],
  p3: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    catmullRom(p0[0], p1[0], p2[0], p3[0], t),
    catmullRom(p0[1], p1[1], p2[1], p3[1], t),
    catmullRom(p0[2], p1[2], p2[2], p3[2], t),
  ];
}

/**
 * يحسب حالة الكاميرا عند زمن محدد بالثواني مع احترام السرعة ومسار الـ keyframes
 */
export function evaluateCamera(config: FlyoverConfig, timeSec: number): CameraState {
  const path = config.path;
  if (path.length === 0) return { position: [0, 0, 5], target: [0, 0, 0], roll: 0, fov: 45 };
  if (path.length === 1) return { position: [...path[0].position], target: [...path[0].target], roll: path[0].roll ?? 0, fov: path[0].fov ?? 45 };

  const scaledTime = timeSec * config.speed;
  const t = Math.max(0, Math.min(scaledTime, config.duration));

  // إيجاد القطعة
  let idx = 0;
  for (let i = 0; i < path.length - 1; i++) {
    if (t >= path[i].t && t <= path[i + 1].t) {
      idx = i;
      break;
    }
    if (t > path[i + 1].t) idx = i + 1;
  }
  if (idx >= path.length - 1) {
    const last = path[path.length - 1];
    return { position: [...last.position], target: [...last.target], roll: last.roll ?? 0, fov: last.fov ?? 45 };
  }

  const k0 = path[Math.max(0, idx - 1)];
  const k1 = path[idx];
  const k2 = path[idx + 1];
  const k3 = path[Math.min(path.length - 1, idx + 2)];

  const segDur = k2.t - k1.t || 1;
  const u = (t - k1.t) / segDur;

  // سلاسة إضافية بـ smoothstep
  const su = u * u * (3 - 2 * u);

  const position = catmullRomVec3(k0.position, k1.position, k2.position, k3.position, su);
  const target = catmullRomVec3(k0.target, k1.target, k2.target, k3.target, su);
  const roll = catmullRom(k0.roll ?? 0, k1.roll ?? 0, k2.roll ?? 0, k3.roll ?? 0, su);
  const fov = catmullRom(k0.fov ?? 45, k1.fov ?? 45, k2.fov ?? 45, k3.fov ?? 45, su);

  // إضافة اهتزاز سينمائي طفيف (handheld)
  const shake = 0.015;
  position[0] += Math.sin(t * 0.7) * shake * 0.5;
  position[1] += Math.cos(t * 0.5) * shake * 0.3;

  return { position, target, roll, fov };
}

/**
 * يبني مصفوفة عرض (view) ومصفوفة إسقاط (projection)
 */
export function lookAt(eye: [number, number, number], center: [number, number, number], up: [number, number, number] = [0, 1, 0]): Float32Array {
  const mz = normalize([eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]]);
  const mx = normalize(cross(up, mz));
  const my = cross(mz, mx);

  // عمود-رئيسي (column-major) لـ WebGL
  return new Float32Array([
    mx[0], my[0], mz[0], 0,
    mx[1], my[1], mz[1], 0,
    mx[2], my[2], mz[2], 0,
    -(mx[0]*eye[0]+mx[1]*eye[1]+mx[2]*eye[2]),
    -(my[0]*eye[0]+my[1]*eye[1]+my[2]*eye[2]),
    -(mz[0]*eye[0]+mz[1]*eye[1]+mz[2]*eye[2]),
    1,
  ]);
}

export function perspective(fovDeg: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

export function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] = a[0*4+row]*b[col*4+0] + a[1*4+row]*b[col*4+1] + a[2*4+row]*b[col*4+2] + a[3*4+row]*b[col*4+3];
    }
  }
  return out;
}

function normalize(v: number[]) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0]/l, v[1]/l, v[2]/l] as [number, number, number];
}
function cross(a: number[], b: number[]) {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]] as [number, number, number];
}
