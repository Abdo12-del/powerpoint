/**
 * إعداد Playwright لالتقاط صفحة الهبوط بطبقاتها
 * - يثبّت الأبعاد عند 1920×1080 مع DPR=2 لضمان سلاسة الحركة
 * - يلتقط كل طبقة بشفافية لاستعمالها في مشهد WebGL2
 */
import type { CaptureViewport } from '../flyover/legacy-types';
import { DEFAULT_VIEWPORT } from '../flyover/legacy-types';

export interface PlaywrightCaptureConfig {
  viewport: CaptureViewport;
  baseUrl: string;
  selectors: Record<string, string>;
  outDir: string;
}

export const playwrightCaptureConfig: PlaywrightCaptureConfig = {
  viewport: DEFAULT_VIEWPORT,
  baseUrl: process.env.CAPTURE_URL ?? 'http://localhost:5173',
  outDir: 'public/cinematic',
  selectors: {
    background: '[data-capture="background"]',
    hero: '[data-capture="hero"]',
    card: '[data-capture="card"]',
    image: '[data-capture="image"]',
    logo: '[data-capture="logo"]',
  },
};

export default playwrightCaptureConfig;
