/**
 * مكونات حركة النص العربي — القاعدة الذهبية: الكلمة وحدة لا تتجزأ، والحركة على الوزن/القناع/الخلفية لا على الحروف.
 * الدليل: docs/TYPOGRAPHY.md — المهارة: .agents/skills/arabic-typography-motion
 */
export { VariableText, type VariableTextProps } from './VariableText';
export { KineticHeadline, type KineticHeadlineProps } from './KineticHeadline';
export { ClipReveal, clipStart, type ClipRevealProps, type ClipDirection } from './ClipReveal';
export { HighlightSweep, type HighlightSweepProps } from './HighlightSweep';
export { FancyText, fancyStyle, type FancyTextProps, type FancyVariant } from './FancyText';
export { FontSpecimen, weightSteps, type FontSpecimenProps } from './FontSpecimen';
export { CalligraphyText, type CalligraphyTextProps, type CalligraphyMode } from './CalligraphyText';
export { NumberRoll, type NumberRollProps } from './NumberRoll';
export { FitText, type FitTextProps } from './FitText';
