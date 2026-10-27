import type { LucideIcon } from 'lucide-react';

export type SimulationDomain = 'physics' | 'chemistry' | 'biology' | 'mathematics';
export type SimulationId = 'projectile' | 'molecule' | 'cell' | 'wave';

export interface SimulationParameter {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
}

export interface SimulationDefinition {
  id: SimulationId;
  domain: SimulationDomain;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  icon: LucideIcon;
  parameters: SimulationParameter[];
}

export type SimulationValues = Record<string, number>;
export interface SimulationPoint { x: number; y: number }
export interface SimulationResult {
  value: number;
  label: string;
  unit: string;
  insight: string;
  points: SimulationPoint[];
}
