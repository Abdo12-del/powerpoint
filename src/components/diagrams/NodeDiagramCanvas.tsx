import { useCallback, useEffect, useMemo, useRef, useState, createRef, type RefObject } from 'react';
import { addEdge, Background, ConnectionLineType, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow, type Connection, type Edge, type Node, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './diagrams.css';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedBeam } from '@/components/gallery';
import { cn } from '@/lib/cn';
import { defaultDiagramDirection, layoutWithDagre } from './layout';
import type { DiagramDirection, DiagramEdge, DiagramNode, DiagramNodeKind, NodeDiagramProps } from './types';

interface FlowNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  kind: DiagramNodeKind;
  width: number;
  height: number;
  sourcePosition: Position;
  targetPosition: Position;
  beamRef: RefObject<HTMLDivElement | null>;
}

type FlowNode = Node<FlowNodeData, 'memoNode'>;
type FlowEdge = Edge;

function handlePositions(direction: DiagramDirection) {
  switch (direction) {
    case 'LR':
      return { sourcePosition: Position.Right, targetPosition: Position.Left };
    case 'TB':
      return { sourcePosition: Position.Bottom, targetPosition: Position.Top };
    case 'BT':
      return { sourcePosition: Position.Top, targetPosition: Position.Bottom };
    default:
      return { sourcePosition: Position.Left, targetPosition: Position.Right };
  }
}

function nodeTone(kind: DiagramNodeKind) {
  switch (kind) {
    case 'start':
      return 'border-emerald-300/60 bg-emerald-400/10 text-emerald-50';
    case 'end':
      return 'border-rose-300/60 bg-rose-400/10 text-rose-50';
    case 'decision':
      return 'border-amber-300/60 bg-amber-400/10 text-amber-50';
    case 'entity':
      return 'border-sky-300/60 bg-sky-400/10 text-sky-50';
    default:
      return 'border-white/15 bg-slate-900 text-slate-100';
  }
}

function DiagramNodeCard({ data, selected }: NodeProps<FlowNode>) {
  const isDecision = data.kind === 'decision';
  return (
    <div
      ref={data.beamRef}
      dir="auto"
      className={cn(
        'relative z-10 flex flex-col items-center justify-center gap-1 rounded-2xl border px-4 py-3 text-center shadow-xl transition-shadow',
        nodeTone(data.kind),
        selected && 'ring-2 ring-amber-300/80 ring-offset-2 ring-offset-slate-950',
        isDecision && 'rotate-45 rounded-xl',
      )}
      style={{ width: data.width, minHeight: data.height }}
    >
      <Handle type="target" position={data.targetPosition} className="!h-2.5 !w-2.5 !border-2 !border-slate-950 !bg-sky-300" />
      <div className={cn('max-w-full', isDecision && '-rotate-45')}>
        <div className="text-sm font-extrabold leading-snug">{data.label}</div>
        {data.description && <div className="mt-1 text-[11px] leading-relaxed text-slate-300">{data.description}</div>}
      </div>
      <Handle type="source" position={data.sourcePosition} className="!h-2.5 !w-2.5 !border-2 !border-slate-950 !bg-amber-300" />
    </div>
  );
}

const nodeTypes = { memoNode: DiagramNodeCard };

function toFlowEdges(edges: DiagramEdge[]): FlowEdge[] {
  return edges.map((edge, index) => ({
    id: edge.id ?? `${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'smoothstep',
    animated: edge.animated ?? false,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    style: { stroke: 'rgba(148, 163, 184, 0.7)', strokeWidth: 1.8 },
    labelStyle: { fill: '#e2e8f0', fontSize: 12, fontWeight: 600 },
    labelBgStyle: { fill: '#020617', fillOpacity: 0.96 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 6,
  }));
}

function DiagramFlow({
  nodes: inputNodes,
  edges: inputEdges,
  pattern,
  direction,
  layout = 'dagre',
  animatedBeams = false,
  interactive = true,
  controls = true,
  miniMap = false,
  className,
}: NodeDiagramProps) {
  const flowDirection = direction ?? defaultDiagramDirection(pattern);
  const positions = useMemo(() => handlePositions(flowDirection), [flowDirection]);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);
  const [layoutPending, setLayoutPending] = useState(layout === 'dagre');
  const [beamRevision, setBeamRevision] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const refs = useRef(new Map<string, RefObject<HTMLDivElement | null>>());
  const reduceMotion = useReducedMotion();
  const { fitView } = useReactFlow<FlowNode, FlowEdge>();

  const beamRefFor = useCallback((id: string) => {
    let ref = refs.current.get(id);
    if (!ref) {
      ref = createRef<HTMLDivElement>();
      refs.current.set(id, ref);
    }
    return ref;
  }, []);

  const makeFlowNodes = useCallback(
    (source: DiagramNode[]): FlowNode[] =>
      source.map((node) => ({
        id: node.id,
        type: 'memoNode',
        position: node.position ?? { x: 0, y: 0 },
        ...(node.width ? { width: node.width } : {}),
        ...(node.height ? { height: node.height } : {}),
        data: {
          label: node.label,
          description: node.description,
          kind: node.kind ?? 'default',
          width: node.width ?? 180,
          height: node.height ?? (node.kind === 'decision' ? 112 : 92),
          sourcePosition: positions.sourcePosition,
          targetPosition: positions.targetPosition,
          beamRef: beamRefFor(node.id),
        },
      })),
    [beamRefFor, positions.sourcePosition, positions.targetPosition],
  );

  useEffect(() => {
    let active = true;
    setLayoutPending(layout === 'dagre');
    const edgeModels = toFlowEdges(inputEdges);
    setEdges(edgeModels);

    void (async () => {
      try {
        const laidOut = layout === 'dagre'
          ? await layoutWithDagre(inputNodes, inputEdges, {
              direction: flowDirection,
              nodeSpacing: pattern === 'tree' ? 48 : 58,
              rankSpacing: pattern === 'tree' ? 78 : 92,
            })
          : inputNodes;
        if (!active) return;
        setNodes(makeFlowNodes(laidOut));
        setLayoutPending(false);
        requestAnimationFrame(() => {
          if (active) void fitView({ padding: 0.2, duration: reduceMotion ? 0 : 360, minZoom: 0.4, maxZoom: 1.4 });
        });
      } catch {
        if (!active) return;
        setNodes(makeFlowNodes(inputNodes));
        setLayoutPending(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [flowDirection, fitView, inputEdges, inputNodes, layout, makeFlowNodes, pattern, reduceMotion, setEdges, setNodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!interactive) return;
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            id: `edge-${current.length + 1}`,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
            style: { stroke: 'rgba(148, 163, 184, 0.7)', strokeWidth: 1.8 },
          },
          current,
        ),
      );
    },
    [interactive, setEdges],
  );

  const showBeams = animatedBeams && !reduceMotion;
  const beamOffset = flowDirection === 'LR'
    ? { startXOffset: 88, endXOffset: -88 }
    : flowDirection === 'RL'
      ? { startXOffset: -88, endXOffset: 88 }
      : flowDirection === 'TB'
        ? { startYOffset: 44, endYOffset: -44 }
        : { startYOffset: -44, endYOffset: 44 };

  return (
    <div ref={stageRef} dir="ltr" className={cn('flow-diagram-theme relative h-full min-h-64 w-full overflow-hidden rounded-2xl bg-slate-950', className)}>
      <ReactFlow<FlowNode, FlowEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={() => setBeamRevision((revision) => revision + 1)}
        nodesDraggable={interactive}
        nodesConnectable={interactive}
        edgesReconnectable={interactive}
        elementsSelectable={interactive}
        panOnDrag
        zoomOnScroll
        fitView
        minZoom={0.25}
        maxZoom={1.8}
        colorMode="dark"
        connectionLineType={ConnectionLineType.SmoothStep}
        attributionPosition="bottom-left"
        className="!bg-transparent"
      >
        <Background color="#334155" gap={24} size={1} />
        {controls && <Controls position="bottom-right" showInteractive={interactive} />}
        {miniMap && <MiniMap position="bottom-left" pannable zoomable nodeColor={(node) => (node.data.kind === 'decision' ? '#fbbf24' : '#38bdf8')} />}
      </ReactFlow>

      {showBeams && edges.map((edge, index) => {
        const fromRef = beamRefFor(edge.source);
        const toRef = beamRefFor(edge.target);
        return (
          <AnimatedBeam
            key={`${edge.id}-${beamRevision}`}
            containerRef={stageRef}
            fromRef={fromRef}
            toRef={toRef}
            curvature={index % 2 === 0 ? -24 : 24}
            delay={0.35 + index * 0.35}
            duration={3.4}
            pathColor="rgba(255,255,255,0.12)"
            pathWidth={2}
            gradientStartColor="#fbbf24"
            gradientStopColor="#38bdf8"
            {...beamOffset}
          />
        );
      })}

      {layoutPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-x-0 top-3 z-30 mx-auto w-fit rounded-full border border-white/10 bg-slate-950/90 px-3 py-1 text-xs text-slate-300"
          role="status"
        >
          جارٍ ترتيب العقد تلقائياً…
        </motion.div>
      )}
    </div>
  );
}

export default function NodeDiagramCanvas(props: NodeDiagramProps) {
  return (
    <ReactFlowProvider>
      <DiagramFlow {...props} />
    </ReactFlowProvider>
  );
}
