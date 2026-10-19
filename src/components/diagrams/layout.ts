import type { DiagramDirection, DiagramEdge, DiagramNode } from './types';

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 92;

export interface DagreLayoutOptions {
  direction?: DiagramDirection;
  nodeSpacing?: number;
  rankSpacing?: number;
  margin?: number;
}

/**
 * Assign top-left positions with Dagre without changing the caller's node data.
 * Dagre is imported on demand so static/manual diagrams do not pull it into the main chunk.
 */
export async function layoutWithDagre(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  { direction = 'RL', nodeSpacing = 54, rankSpacing = 84, margin = 28 }: DagreLayoutOptions = {},
): Promise<DiagramNode[]> {
  const { default: dagre } = await import('@dagrejs/dagre');
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: margin,
    marginy: margin,
    ranker: 'network-simplex',
  });

  const knownIds = new Set(nodes.map((node) => node.id));
  for (const node of nodes) {
    graph.setNode(node.id, {
      width: node.width ?? DEFAULT_NODE_WIDTH,
      height: node.height ?? (node.kind === 'decision' ? 112 : DEFAULT_NODE_HEIGHT),
    });
  }
  for (const edge of edges) {
    if (knownIds.has(edge.source) && knownIds.has(edge.target)) graph.setEdge(edge.source, edge.target);
  }

  dagre.layout(graph);
  return nodes.map((node) => {
    const box = graph.node(node.id) as { x: number; y: number } | undefined;
    const width = node.width ?? DEFAULT_NODE_WIDTH;
    const height = node.height ?? (node.kind === 'decision' ? 112 : DEFAULT_NODE_HEIGHT);
    if (!box || !Number.isFinite(box.x) || !Number.isFinite(box.y)) {
      return { ...node, position: node.position ?? { x: margin, y: margin } };
    }
    return { ...node, position: { x: box.x - width / 2, y: box.y - height / 2 } };
  });
}

/** RTL-friendly default direction for the diagram patterns used in Arabic memos. */
export function defaultDiagramDirection(pattern: 'tree' | 'relation' | 'process' | undefined): DiagramDirection {
  return pattern === 'tree' ? 'TB' : 'RL';
}
