import { useMemo, useState } from 'react';
import { BookOpen, Brain, CheckCircle2, GitBranch, Sparkles, Zap } from 'lucide-react';
import { resolveConceptMapForView } from '../utils/lessonConceptMap';
import { ContentFadeIn, ConceptMapSkeleton } from './LoadingPrimitives';

const EDGE_STYLES = {
  prerequisite: { className: 'text-primary', dash: 'none', label: 'Learning path', width: 3, opacity: 1 },
  depends_on: { className: 'text-red-500', dash: '4 4', label: 'Depends on', width: 2, opacity: 0.7 },
  related: { className: 'text-violet-500', dash: '6 4', label: 'Related', width: 2, opacity: 0.65 },
  advanced: { className: 'text-amber-500', dash: '3 6', label: 'Advanced', width: 2, opacity: 0.65 },
  example: { className: 'text-sky-500', dash: '2 5', label: 'Example', width: 2, opacity: 0.65 },
};

const PAGE_W = 124;
const PAGE_H = 52;
const PAGE_W_COMPACT = 108;
const PAGE_H_COMPACT = 44;

function spreadX(index, total, padding, width) {
  if (total <= 1) return width / 2;
  return padding + (index * (width - padding * 2)) / (total - 1);
}

function buildPath(from, to, arc = 0) {
  if (Math.abs(from.y - to.y) < 2 && from.x !== to.x) {
    const midX = (from.x + to.x) / 2;
    const y = from.y;
    return `M ${from.x} ${y} L ${midX} ${y - 8} L ${to.x} ${y}`;
  }
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - arc;
  return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
}

function pageAnchors(node, w, h) {
  return {
    right: { x: node.x + w / 2, y: node.y },
    left: { x: node.x - w / 2, y: node.y },
    bottom: { x: node.x, y: node.y + h / 2 },
    top: { x: node.x, y: node.y - h / 2 },
    center: { x: node.x, y: node.y },
  };
}

function conceptAnchor(node, r, side) {
  if (side === 'top') return { x: node.x, y: node.y - r };
  return { x: node.x, y: node.y + r };
}

function MasteryRing({ cx, cy, r, mastery = 0 }) {
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(mastery, 100) / 100) * circumference;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity="0.5" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        className="transition-all duration-700 ease-out"
      />
    </g>
  );
}

function estimateCalloutHeight(title, compact) {
  const charsPerLine = compact ? 26 : 32;
  const lines = Math.max(1, Math.ceil(String(title).length / charsPerLine));
  return Math.min(compact ? 56 : 72, 28 + lines * 16);
}

function NodeHoverCallout({ node, x, y, variant, pageIndex, compact, pageH, conceptR }) {
  const maxW = variant === 'page' ? (compact ? 200 : 240) : compact ? 180 : 220;
  const calloutH = estimateCalloutHeight(node.title, compact);
  const calloutY =
    variant === 'page'
      ? y + pageH / 2 + (compact ? 8 : 12)
      : y + conceptR + (compact ? 10 : 14);

  return (
    <foreignObject
      x={x - maxW / 2}
      y={calloutY}
      width={maxW}
      height={calloutH}
      className="overflow-visible"
    >
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className="pointer-events-none animate-concept-callout-in rounded-xl border border-primary/20 bg-popover/95 px-3 py-2 text-center shadow-lg backdrop-blur-sm transition-shadow duration-300"
      >
        {variant === 'page' ? (
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            Page {pageIndex + 1}
          </p>
        ) : (
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-500">
            Concept
          </p>
        )}
        <p className="text-xs font-semibold leading-snug text-foreground">{node.title}</p>
        {node.completed && (
          <p className="mt-1 flex items-center justify-center gap-1 text-[10px] font-medium text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </p>
        )}
        {typeof node.mastery === 'number' && node.mastery > 0 && (
          <p className="mt-1 text-[10px] font-medium text-muted-foreground">
            {node.mastery}% mastery
          </p>
        )}
      </div>
    </foreignObject>
  );
}

function NodeDetailBar({ node, pageIndex, onClear }) {
  if (!node) {
    return (
      <div className="border-t border-border/40 bg-muted/20 px-4 py-3 text-center text-xs text-muted-foreground">
        Hover or tap a node to read its full title.
      </div>
    );
  }

  const isPage = node.type === 'page';

  return (
    <div className="flex items-start justify-between gap-3 border-t border-border/40 bg-card/90 px-4 py-3 backdrop-blur-sm">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              isPage ? 'bg-primary/10 text-primary' : 'bg-violet-500/10 text-violet-600'
            }`}
          >
            {isPage ? `Page ${pageIndex + 1}` : 'Concept'}
          </span>
          {node.completed && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          )}
          {typeof node.mastery === 'number' && node.mastery > 0 && (
            <span className="text-[10px] font-medium text-muted-foreground">
              {node.mastery}% mastery
            </span>
          )}
        </div>
        <p className="text-sm font-semibold leading-snug text-foreground">{node.title}</p>
      </div>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function ConceptMapGraph({ nodes, edges, compact }) {
  const pageW = compact ? PAGE_W_COMPACT : PAGE_W;
  const pageH = compact ? PAGE_H_COMPACT : PAGE_H;

  const layout = useMemo(() => {
    const pageNodes = nodes
      .filter((n) => n.type === 'page')
      .sort((a, b) => {
        const idxA = Number(String(a.pageId ?? a.id).match(/-(\d+)$/)?.[1] ?? 0);
        const idxB = Number(String(b.pageId ?? b.id).match(/-(\d+)$/)?.[1] ?? 0);
        return idxA - idxB;
      });
    const conceptNodes = nodes.filter((n) => n.type === 'concept');
    const width = Math.max(720, pageNodes.length * 150, conceptNodes.length * 130);
    const height = conceptNodes.length > 0 ? (compact ? 320 : 440) : compact ? 220 : 240;
    const pad = 72;
    const pageY = compact ? 64 : 80;

    const pagePositions = pageNodes.map((node, index) => ({
      ...node,
      x: spreadX(index, pageNodes.length, pad, width),
      y: pageY,
    }));

    const conceptPositions = conceptNodes.map((node, index) => ({
      ...node,
      x: spreadX(index, conceptNodes.length, pad, width),
      y: compact ? 200 : 290,
    }));

    const posMap = Object.fromEntries(
      [...pagePositions, ...conceptPositions].map((node) => [node.id, node]),
    );

    const pathRailY = pageY + pageH / 2 + (compact ? 18 : 22);

    const pagePathSegments = pagePositions.slice(0, -1).map((page, index) => {
      const next = pagePositions[index + 1];
      const from = pageAnchors(page, pageW, pageH).right;
      const to = pageAnchors(next, pageW, pageH).left;
      return {
        key: `${page.id}-${next.id}`,
        from: { x: from.x, y: pathRailY },
        to: { x: to.x, y: pathRailY },
        mid: { x: (from.x + to.x) / 2, y: pathRailY },
        fromPage: page,
        toPage: next,
      };
    });

    const drawnEdges = edges
      .map((edge) => {
        const fromNode = posMap[edge.from];
        const toNode = posMap[edge.to];
        if (!fromNode || !toNode) return null;

        let from;
        let to;
        if (fromNode.type === 'page' && toNode.type === 'page') {
          from = pageAnchors(fromNode, pageW, pageH).right;
          from = { x: from.x, y: pathRailY };
          to = pageAnchors(toNode, pageW, pageH).left;
          to = { x: to.x, y: pathRailY };
        } else if (fromNode.type === 'concept' && toNode.type === 'page') {
          const r = compact ? 28 : 34;
          from = conceptAnchor(fromNode, r, 'top');
          to = pageAnchors(toNode, pageW, pageH).bottom;
        } else if (fromNode.type === 'concept' && toNode.type === 'concept') {
          const r = compact ? 28 : 34;
          from = conceptAnchor(fromNode, r, 'top');
          to = conceptAnchor(toNode, r, 'top');
        } else {
          from = { x: fromNode.x, y: fromNode.y };
          to = { x: toNode.x, y: toNode.y };
        }

        return {
          ...edge,
          from: { ...from, id: fromNode.id },
          to: { ...to, id: toNode.id },
        };
      })
      .filter(Boolean);

    return {
      width,
      height,
      pagePositions,
      conceptPositions,
      drawnEdges,
      pagePathSegments,
      pathRailY,
    };
  }, [nodes, edges, compact, pageW, pageH]);

  const [hoveredNode, setHoveredNode] = useState(null);
  const [pinnedNode, setPinnedNode] = useState(null);
  const activeNode = pinnedNode ?? hoveredNode;

  const activePageIndex = useMemo(() => {
    if (!activeNode || activeNode.type !== 'page') return 0;
    return layout.pagePositions.findIndex((page) => page.id === activeNode.id);
  }, [activeNode, layout.pagePositions]);

  const handleNodeEnter = (node, meta = {}) => {
    setHoveredNode({ ...node, ...meta });
  };

  const handleNodeLeave = () => {
    setHoveredNode(null);
  };

  const handleNodeClick = (node, meta = {}) => {
    setPinnedNode((current) =>
      current?.id === node.id ? null : { ...node, ...meta },
    );
  };

  return (
    <div className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-card/80 to-violet-500/5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-8 top-8 h-32 w-32 animate-float rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute bottom-4 right-8 h-40 w-40 animate-float-delayed rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-24 w-24 animate-float-slow rounded-full bg-sky-500/10 blur-2xl" />
      </div>

      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="relative z-[1] h-auto w-full animate-concept-layout transition-[viewBox] duration-500 ease-out"
        role="img"
        aria-label="Interactive concept map"
      >
        <defs>
          <linearGradient id="pageNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.18)" />
            <stop offset="100%" stopColor="hsl(var(--card))" />
          </linearGradient>
          <linearGradient id="conceptNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(262 83% 58% / 0.15)" />
            <stop offset="100%" stopColor="hsl(var(--card))" />
          </linearGradient>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main learning path rail — always visible below page nodes */}
        {layout.pagePathSegments.length > 0 && (
          <g className="text-primary" aria-hidden>
            <line
              x1={layout.pagePathSegments[0].from.x}
              y1={layout.pathRailY}
              x2={layout.pagePathSegments[layout.pagePathSegments.length - 1].to.x}
              y2={layout.pathRailY}
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.2"
            />
            {layout.pagePathSegments.map((seg, index) => (
              <g key={seg.key}>
                <line
                  x1={seg.from.x}
                  y1={seg.from.y}
                  x2={seg.to.x}
                  y2={seg.to.y}
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-concept-edge-in transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
                <polygon
                  points={`${seg.to.x},${seg.to.y} ${seg.to.x - 10},${seg.to.y - 5} ${seg.to.x - 10},${seg.to.y + 5}`}
                  fill="currentColor"
                />
                {!compact && (
                  <text
                    x={seg.mid.x}
                    y={seg.mid.y + 16}
                    textAnchor="middle"
                    className="fill-primary text-[9px] font-semibold uppercase tracking-wide"
                  >
                    Next
                  </text>
                )}
              </g>
            ))}
            {layout.pagePositions.map((page) => (
              <g key={`drop-${page.id}`}>
                <line
                  x1={page.x}
                  y1={page.y + pageH / 2}
                  x2={page.x}
                  y2={layout.pathRailY}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  opacity="0.55"
                />
                <circle cx={page.x} cy={layout.pathRailY} r="5" fill="currentColor" />
              </g>
            ))}
          </g>
        )}

        {/* Single-page lesson: vertical spine into concept layer */}
        {layout.pagePathSegments.length === 0 && layout.pagePositions.length === 1 && layout.conceptPositions.length > 0 && (
          <g className="text-primary" aria-hidden>
            <line
              x1={layout.pagePositions[0].x}
              y1={layout.pagePositions[0].y + pageH / 2}
              x2={layout.pagePositions[0].x}
              y2={layout.conceptPositions[0].y - (compact ? 28 : 34) - 8}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 4"
              className="animate-concept-flow"
            />
            <circle
              cx={layout.pagePositions[0].x}
              cy={layout.pagePositions[0].y + pageH / 2 + 12}
              r="5"
              fill="currentColor"
            />
          </g>
        )}

        {/* Concept & cross-layer edges (behind nodes) */}
        {layout.drawnEdges
          .filter((edge) => edge.type !== 'prerequisite')
          .map((edge, index) => {
          const style = EDGE_STYLES[edge.type] ?? EDGE_STYLES.related;
          const arc = edge.from.y === edge.to.y ? 0 : 40;
          const path = buildPath(edge.from, edge.to, arc);
          const highlighted = hoveredNode?.id === edge.from.id || hoveredNode?.id === edge.to.id
            || pinnedNode?.id === edge.from.id || pinnedNode?.id === edge.to.id;
          return (
            <g key={`${edge.from.id}-${edge.to.id}-${edge.type}`}>
              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth={highlighted ? style.width + 0.5 : style.width}
                strokeDasharray={style.dash === 'none' ? 'none' : style.dash}
                strokeDashoffset="0"
                opacity={highlighted ? 0.95 : style.opacity}
                className={`${style.className} animate-concept-edge-in transition-all duration-500 ease-out`}
                style={{ animationDelay: `${index * 120}ms` }}
              />
              {!compact && highlighted && (
                <text
                  x={(edge.from.x + edge.to.x) / 2}
                  y={(edge.from.y + edge.to.y) / 2 - arc / 2 - 6}
                  textAnchor="middle"
                  className="fill-primary text-[9px] font-semibold uppercase tracking-wide"
                >
                  {style.label}
                </text>
              )}
            </g>
          );
        })}

        {layout.pagePositions.map((node, index) => {
          const w = pageW;
          const h = pageH;
          const x = node.x - w / 2;
          const y = node.y - h / 2;
          const active = activeNode?.id === node.id;
          const done = node.completed;
          return (
            <g
              key={node.id}
              className="animate-concept-node-in cursor-pointer"
              style={{ animationDelay: `${index * 80}ms` }}
              onMouseEnter={() => handleNodeEnter(node, { type: 'page', pageIndex: index })}
              onMouseLeave={handleNodeLeave}
              onClick={() => handleNodeClick(node, { type: 'page', pageIndex: index })}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleNodeClick(node, { type: 'page', pageIndex: index });
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Page ${index + 1}: ${node.title}`}
              filter={done || active ? 'url(#nodeGlow)' : undefined}
            >
              <title>{`Page ${index + 1}: ${node.title}`}</title>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx="14"
                fill={done ? 'hsl(142 76% 36% / 0.12)' : 'url(#pageNodeGrad)'}
                stroke={done ? 'hsl(142 76% 36% / 0.55)' : active ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                strokeWidth={active ? 2 : 1}
                className={`transition-all duration-300 ease-out ${done ? 'animate-concept-glow' : ''}`}
              />
              <foreignObject x={x + 8} y={y + 8} width={w - 16} height={h - 16}>
                <div className="flex h-full flex-col justify-center gap-0.5 overflow-hidden text-center">
                  <span className="truncate text-[10px] font-bold uppercase tracking-wide text-primary">
                    Page {index + 1}
                  </span>
                  <span
                    className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground"
                    title={node.title}
                  >
                    {node.title}
                  </span>
                </div>
              </foreignObject>
              {active && (
                <NodeHoverCallout
                  node={node}
                  x={node.x}
                  y={node.y}
                  variant="page"
                  pageIndex={index}
                  compact={compact}
                  pageH={h}
                  conceptR={compact ? 28 : 34}
                />
              )}
            </g>
          );
        })}

        {layout.conceptPositions.map((node, index) => {
          const r = compact ? 28 : 34;
          const active = activeNode?.id === node.id;
          const mastery = typeof node.mastery === 'number' ? node.mastery : 0;
          return (
            <g
              key={node.id}
              className="animate-concept-node-in cursor-pointer"
              style={{ animationDelay: `${120 + index * 90}ms` }}
              onMouseEnter={() => handleNodeEnter(node, { type: 'concept' })}
              onMouseLeave={handleNodeLeave}
              onClick={() => handleNodeClick(node, { type: 'concept' })}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleNodeClick(node, { type: 'concept' });
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Concept: ${node.title}`}
            >
              <title>{`Concept: ${node.title}`}</title>
              <MasteryRing cx={node.x} cy={node.y} r={r + 6} mastery={mastery} />
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill="url(#conceptNodeGrad)"
                stroke={active ? 'hsl(262 83% 58%)' : 'hsl(var(--border))'}
                strokeWidth={active ? 2 : 1}
                className="transition-all duration-300"
              />
              <foreignObject
                x={node.x - r + 6}
                y={node.y - r + 6}
                width={(r - 6) * 2}
                height={(r - 6) * 2}
              >
                <div className="flex h-full items-center justify-center text-center">
                  <span
                    className="line-clamp-3 text-[10px] font-medium leading-tight text-foreground"
                    title={node.title}
                  >
                    {node.title}
                  </span>
                </div>
              </foreignObject>
              {active && (
                <NodeHoverCallout
                  node={node}
                  x={node.x}
                  y={node.y}
                  variant="concept"
                  pageIndex={index}
                  compact={compact}
                  pageH={pageH}
                  conceptR={r}
                />
              )}
              {mastery > 0 && (
                <text
                  x={node.x}
                  y={node.y + r + 16}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px] font-semibold"
                >
                  {mastery}% mastery
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <NodeDetailBar
        node={activeNode}
        pageIndex={
          activeNode?.type === 'page'
            ? (activeNode.pageIndex ?? activePageIndex)
            : 0
        }
        onClear={pinnedNode ? () => setPinnedNode(null) : null}
      />
    </div>
  );
}

export default function ConceptMapView({
  conceptMap,
  lesson,
  lessonContent,
  lessonState,
  compact = false,
  loading = false,
}) {
  const resolvedMap = useMemo(
    () =>
      resolveConceptMapForView({
        conceptMap,
        lesson,
        lessonContent,
        lessonState,
      }),
    [conceptMap, lesson, lessonContent, lessonState],
  );

  const { nodes = [], edges = [] } = resolvedMap ?? {};

  const stats = useMemo(() => {
    const pageNodes = nodes.filter((n) => n.type === 'page');
    const conceptNodes = nodes.filter((n) => n.type === 'concept');
    const completedPages = pageNodes.filter((n) => n.completed).length;
    const avgMastery = conceptNodes.length
      ? Math.round(
          conceptNodes.reduce((sum, n) => sum + (n.mastery ?? 0), 0) / conceptNodes.length,
        )
      : 0;
    return { pageNodes, conceptNodes, completedPages, avgMastery };
  }, [nodes]);

  if (loading) {
    return <ConceptMapSkeleton compact={compact} />;
  }

  if (!nodes.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
        <Brain className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Concept map will appear once lesson content is synced.
        </p>
      </div>
    );
  }

  return (
    <ContentFadeIn className={compact ? 'space-y-4' : 'space-y-6'}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <h3 className="font-display text-base font-semibold">Knowledge graph</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Follow the learning path, then explore how concepts connect.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatChip icon={BookOpen} label="Pages" value={`${stats.completedPages}/${stats.pageNodes.length}`} />
          <StatChip icon={Brain} label="Concepts" value={stats.conceptNodes.length} />
          {stats.avgMastery > 0 && (
            <StatChip icon={Sparkles} label="Mastery" value={`${stats.avgMastery}%`} highlight />
          )}
        </div>
      </div>

      <ConceptMapGraph nodes={nodes} edges={edges} compact={compact} />

      {!compact && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Connection types
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(EDGE_STYLES).map(([key, style]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide"
                >
                  <span className={`h-0.5 w-5 rounded-full bg-current ${style.className}`} />
                  {style.label}
                </span>
              ))}
            </div>
          </div>

          {edges.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Key relationships
              </p>
              <ul className="max-h-36 space-y-2 overflow-y-auto text-sm">
                {[...edges]
                  .sort((a, b) => (a.type === 'prerequisite' ? -1 : 0) - (b.type === 'prerequisite' ? -1 : 0))
                  .slice(0, 8)
                  .map((edge) => {
                  const from = nodes.find((n) => n.id === edge.from);
                  const to = nodes.find((n) => n.id === edge.to);
                  const style = EDGE_STYLES[edge.type] ?? EDGE_STYLES.related;
                  return (
                    <li
                      key={`${edge.from}-${edge.to}-${edge.type}`}
                      className="flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/30 px-2.5 py-1.5"
                    >
                      <span className="font-medium text-foreground">{from?.title ?? '—'}</span>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                        {style.label}
                      </span>
                      <span className="font-medium text-foreground">{to?.title ?? '—'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </ContentFadeIn>
  );
}

function StatChip({ icon: Icon, label, value, highlight = false }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${
        highlight
          ? 'border-primary/30 bg-primary/10'
          : 'border-border/50 bg-card/60'
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
