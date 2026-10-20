/**
 * حزمة الموشن جرافيك البحثي — Research Distilbook Motion Graphics
 */

export { DistilbookShowreel } from './DistilbookShowreel';
export type { DistilbookShowreelHandle, DistilbookShowreelProps } from './DistilbookShowreel';
export { buildDistilbookTimeline } from './timeline';
export type { BuildDistilbookTimelineOptions, DistilbookTimelineHandle } from './timeline';
export { DistillStage } from './effects3d/DistillStage';

export {
  DISTILBOOK_SCENES,
  DISTILBOOK_DURATION,
  DISTILBOOK_IDENTITY,
  DEFAULT_DISTILBOOK_CONFIG,
  REF_NODES,
  REF_EDGES,
  sceneAt,
} from './types';
export type {
  DistilbookSceneId,
  DistilbookSceneSpec,
  DistilbookTransition,
  DistilbookConfig,
  DistilbookStat,
  DistilbookSummaryCard,
  RefNode,
} from './types';

export { OpeningScene } from './scenes/OpeningScene';
export { ProblemScene } from './scenes/ProblemScene';
export { DistillScene } from './scenes/DistillScene';
export { IdeasScene } from './scenes/IdeasScene';
export { ReferencesScene } from './scenes/ReferencesScene';
export { SummaryScene } from './scenes/SummaryScene';
export { FinaleScene } from './scenes/FinaleScene';
export { DistilbookLab } from './lab/DistilbookLab';
