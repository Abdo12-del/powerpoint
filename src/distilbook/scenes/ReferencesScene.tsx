import { REF_NODES, REF_EDGES, DISTILBOOK_IDENTITY } from '../types';

/**
 * مشهد المراجع — شبكة استشهادات (SVG)
 * الوصلات تُرسم بمسار pathLength=1، والعقد تكبر من نصف قطر 0 (attr — آمنة في jsdom)
 */
export function ReferencesScene() {
  const violet = DISTILBOOK_IDENTITY.violet;
  return (
    <div data-scene="references" className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
      <p className="font-mono text-[11px] tracking-[0.4em] text-violet-300">CITATION NETWORK</p>

      {/* الشبكة */}
      <div data-beat className="w-full max-w-md">
      <svg
        viewBox="0 0 400 240"
        className="h-auto w-full drop-shadow-[0_0_30px_rgba(167,139,250,0.25)]"
        role="img"
        aria-label="شبكة مراجع تتكون حول بحثك"
      >
        {/* الوصلات — تُرسم */}
        {REF_EDGES.map(([a, b], i) => {
          const na = REF_NODES[a];
          const nb = REF_NODES[b];
          return (
            <line
              key={i}
              data-edge
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke={violet}
              strokeOpacity={0.5}
              strokeWidth={1.6}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
            />
          );
        })}

        {/* العقد — تنبثق (نصف القطر يتحرك عبر attr، والشفافية عبر autoAlpha) */}
        {REF_NODES.map((n, i) => (
          <g key={i} data-ref-node style={{ opacity: 0 }}>
            <circle
              data-ref-circle
              data-r={n.r}
              cx={n.x}
              cy={n.y}
              r={0}
              fill={n.center ? `${DISTILBOOK_IDENTITY.teal}22` : `${violet}26`}
              stroke={n.center ? DISTILBOOK_IDENTITY.teal : violet}
              strokeWidth={n.center ? 2.5 : 1.5}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              fontSize={n.center ? 11 : 8}
              fontWeight="bold"
              fill={n.center ? '#5eead4' : '#ddd6fe'}
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      </div>

      {/* بذيق الإحصاء */}
      <div data-ref-chip className="flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/15 px-4 py-1.5">
        <span className="text-sm font-black text-violet-200">+١٢٠ مصدراً</span>
        <span className="text-[11px] text-violet-300/80">مرتبطة تلقائياً بكل فكرة</span>
      </div>
    </div>
  );
}
