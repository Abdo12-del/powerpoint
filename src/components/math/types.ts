import type { ReactNode } from 'react';

export interface MathFormulaProps {
  /** KaTeX-compatible TeX; HTML-trusting commands stay disabled. */
  tex: string;
  /** Optional spoken label; KaTeX also includes MathML in the rendered output. */
  ariaLabel?: string;
  className?: string;
}

export interface UnitValueProps {
  value: string | number;
  /** mhchem unit grammar, for example `m.s^{-2}` or `kg.m/s^2`. */
  unit: string;
  ariaLabel?: string;
  className?: string;
}

export interface ChemicalEquationProps {
  /** mhchem equation body without the surrounding `\\ce{...}`. */
  equation: string;
  ariaLabel?: string;
  className?: string;
}

export interface EquationStep {
  id?: string;
  tex: string;
  label?: ReactNode;
  note?: ReactNode;
}

export interface EquationRevealProps {
  steps: readonly EquationStep[];
  className?: string;
  ariaLabel?: string;
  /** Delay before the first step, in seconds. */
  initialDelay?: number;
  /** Interval between successive reveals, in seconds. */
  stagger?: number;
}

export type PlotDomain = [number, number];

export interface FunctionPlotProps {
  /** Real-valued function to plot. Defaults to sin(x). */
  fn?: (x: number) => number;
  /** Short label drawn in the plot, e.g. `f(x) = sin(x)`. */
  label?: string;
  xDomain?: PlotDomain;
  yDomain?: PlotDomain;
  startAt?: number;
  height?: number;
  ariaLabel?: string;
  className?: string;
}
