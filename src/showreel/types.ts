/**
 * أنواع حزمة الموشن الشورييل الإبداعي — Motion Design Showreel
 * 15 ثانية، تزامن مع الموسيقى، انتقالات Slide/Zoom، تنسيق بصري جريء
 */

export type ShowreelSceneId = 'kinetic' | 'transition3d' | 'parallax' | 'glitch' | 'morph' | 'particles' | 'finale';

export interface ShowreelScene {
  id: ShowreelSceneId;
  /** التوقيت بالثواني */
  start: number;
  end: number;
  title: string;
  subtitle?: string;
  color: string;
  // تأثيرات مفعلة في هذه المشهد
  effects: Array<'kinetic' | '3d' | 'parallax' | 'glitch' | 'morph' | 'particles' | 'slide' | 'zoom'>;
}

export const SHOWREEL_SCENES: ShowreelScene[] = [
  { id: 'kinetic', start: 0, end: 2.2, title: 'KINETIC', subtitle: 'Typography — كلمات تتنفس وزناً', color: '#fbbf24', effects: ['kinetic', 'slide'] },
  { id: 'transition3d', start: 2.2, end: 4.4, title: 'DEPTH', subtitle: '3D Transitions — انقلابات فراغية', color: '#38bdf8', effects: ['3d', 'zoom'] },
  { id: 'parallax', start: 4.4, end: 6.6, title: 'PARALLAX', subtitle: 'طبقات بسرعات متفاوتة', color: '#a78bfa', effects: ['parallax', 'slide'] },
  { id: 'glitch', start: 6.6, end: 8.8, title: 'GLITCH', subtitle: 'تشويش رقمي — RGB Split', color: '#fb7185', effects: ['glitch', 'slide'] },
  { id: 'morph', start: 8.8, end: 11, title: 'MORPH', subtitle: 'تحوّل الأشكال الهندسية', color: '#34d399', effects: ['morph', 'zoom'] },
  { id: 'particles', start: 11, end: 13.2, title: 'PARTICLES', subtitle: 'انفجار جسيمات متزامن مع الإيقاع', color: '#f472b6', effects: ['particles', 'parallax'] },
  { id: 'finale', start: 13.2, end: 15, title: 'SHOWREEL', subtitle: 'حكاية بصرية متكاملة', color: '#fbbf24', effects: ['kinetic', 'particles'] },
];

export const SHOWREEL_DURATION = 15;

export interface ShowreelConfig {
  duration: number;
  autoPlay: boolean;
  loop: boolean;
  /** هل المزامنة مع الموسيقى مفعلة */
  syncToMusic: boolean;
  /** نبضات في الدقيقة للموسيقى (للمزامنة) */
  bpm: number;
  /** مستوى الصوت 0..1 */
  volume: number;
  brand: string;
  tagline: string;
}

export const DEFAULT_SHOWREEL_CONFIG: ShowreelConfig = {
  duration: SHOWREEL_DURATION,
  autoPlay: true,
  loop: true,
  syncToMusic: true,
  bpm: 128,
  volume: 0.7,
  brand: 'STUDIO SHOWREEL',
  tagline: 'Motion Design — حكاية تُروى بالحركة',
};
