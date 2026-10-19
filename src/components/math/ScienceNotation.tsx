import { MathBlock, MathInline } from './MathFormula';
import type { ChemicalEquationProps, UnitValueProps } from './types';

/** Render a measured quantity through mhchem's `\\pu{...}` unit grammar. */
export function UnitValue({ value, unit, ariaLabel, className }: UnitValueProps) {
  return <MathInline tex={`\\pu{${value} ${unit}}`} ariaLabel={ariaLabel} className={className} />;
}

/** Render a chemical equation with mhchem's `\\ce{...}` chemistry notation. */
export function ChemicalEquation({ equation, ariaLabel, className }: ChemicalEquationProps) {
  return <MathBlock tex={`\\ce{${equation}}`} ariaLabel={ariaLabel} className={className} />;
}
