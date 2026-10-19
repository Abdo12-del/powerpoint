export type DiagramDirection = 'LR' | 'RL' | 'TB' | 'BT';
export type DiagramLayout = 'dagre' | 'manual';
export type DiagramPattern = 'tree' | 'relation' | 'process';
export type DiagramNodeKind = 'default' | 'start' | 'end' | 'decision' | 'entity';

export interface DiagramPosition {
  x: number;
  y: number;
}

/** Input node model shared by the Dagre layout helper and the React Flow view. */
export interface DiagramNode {
  id: string;
  label: string;
  description?: string;
  kind?: DiagramNodeKind;
  position?: DiagramPosition;
  width?: number;
  height?: number;
}

export interface DiagramEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface NodeDiagramProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  /** Sets a sensible default direction and spacing for common memo diagrams. */
  pattern?: DiagramPattern;
  direction?: DiagramDirection;
  /** Dagre is MIT-licensed. Use manual when positions are explicitly provided. */
  layout?: DiagramLayout;
  /** Overlay the existing AnimatedBeam component on graph edges. */
  animatedBeams?: boolean;
  interactive?: boolean;
  controls?: boolean;
  miniMap?: boolean;
  height?: number | string;
  className?: string;
}
