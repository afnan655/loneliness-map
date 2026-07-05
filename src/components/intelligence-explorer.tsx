"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  Controls,
  Edge,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  NodeProps,
  NodeTypes,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import clsx from "clsx";
import {
  ArrowRight,
  Brain,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers3,
  Network,
  PlayCircle,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import Link from "next/link";
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  categoryColors,
  conceptById,
  conceptList,
  getConnectedIds,
  getRelatedConcepts,
  graphEdges,
  intelligenceFor,
  type Concept,
} from "@/lib/graph";

const primaryIds = [
  "social-loneliness",
  "emotional-loneliness",
  "belonging-loneliness",
  "purpose-loneliness",
  "identity-barriers",
  "existential-loneliness",
];

const demoPath = ["loneliness", "belonging-loneliness", "community-membership", "running-club"];

type ConceptNodeData = {
  label: string;
  nodeStyle: CSSProperties;
};

function ConceptNode({ data }: NodeProps<Node<ConceptNodeData>>) {
  return (
    <div style={data.nodeStyle}>
      <Handle className="!h-1 !w-1 !border-0 !bg-transparent" position={Position.Top} type="target" />
      <div className="pointer-events-none">{data.label}</div>
      <Handle className="!h-1 !w-1 !border-0 !bg-transparent" position={Position.Bottom} type="source" />
    </div>
  );
}

const nodeTypes = {
  concept: ConceptNode,
} satisfies NodeTypes;

function safeNodeType(type?: string) {
  const requestedType = type ?? "concept";
  return requestedType in nodeTypes ? requestedType : undefined;
}

const branchAngles: Record<string, number> = {
  "social-loneliness": -155,
  "emotional-loneliness": -95,
  "belonging-loneliness": -30,
  "purpose-loneliness": 32,
  "identity-barriers": 96,
  "existential-loneliness": 155,
};

function conceptPosition(concept: Concept): { x: number; y: number } {
  if (concept.id === "loneliness") return { x: 0, y: 0 };
  const primaryIndex = primaryIds.indexOf(concept.id);
  if (primaryIndex >= 0) {
    const angle = (branchAngles[concept.id] * Math.PI) / 180;
    return { x: Math.cos(angle) * 360, y: Math.sin(angle) * 260 };
  }

  const parentEdge = graphEdges.find((edge) => primaryIds.includes(edge.source) && edge.target === concept.id);
  const parentId = parentEdge?.source ?? graphEdges.find((edge) => edge.target === concept.id)?.source ?? "loneliness";
  const parent = conceptById.get(parentId);
  const siblings = conceptList.filter((item) => graphEdges.some((edge) => edge.source === parentId && edge.target === item.id));
  const index = Math.max(0, siblings.findIndex((item) => item.id === concept.id));
  const parentPos = parent ? conceptPosition(parent) : { x: 0, y: 0 };
  const baseAngle = ((branchAngles[parentId] ?? (index * 35)) * Math.PI) / 180;
  const fan = (index - siblings.length / 2) * 34;
  const angle = baseAngle + (fan * Math.PI) / 180;
  const radius = parentId === "loneliness" ? 300 : 250 + (index % 3) * 34;
  return { x: parentPos.x + Math.cos(angle) * radius, y: parentPos.y + Math.sin(angle) * radius };
}

function buildGraph(selectedId: string, searchId: string | null, collapsed: Set<string>, revealedPath: Set<string>) {
  const visible = new Set(["loneliness", ...primaryIds]);
  primaryIds.forEach((primaryId) => {
    if (!collapsed.has(primaryId)) {
      graphEdges
        .filter((edge) => edge.source === primaryId)
        .forEach((edge) => visible.add(edge.target));
    }
  });

  if (searchId) {
    visible.add(searchId);
    getConnectedIds(searchId).forEach((id) => visible.add(id));
  }

  revealedPath.forEach((id) => visible.add(id));

  const highlighted = new Set<string>();
  if (revealedPath.size > 0) {
    revealedPath.forEach((id) => highlighted.add(id));
  } else if (searchId) {
    highlighted.add(searchId);
    getConnectedIds(searchId).forEach((id) => highlighted.add(id));
  } else {
    highlighted.add(selectedId);
    getConnectedIds(selectedId).forEach((id) => highlighted.add(id));
  }

  const nodes: Node[] = conceptList
    .filter((concept) => visible.has(concept.id))
    .map((concept) => {
      const palette = categoryColors[concept.category] ?? categoryColors.Social;
      const isFocus = concept.id === selectedId || concept.id === searchId;
      const isHighlighted = highlighted.has(concept.id);
      return {
        id: concept.id,
        type: safeNodeType(concept.type),
        position: conceptPosition(concept),
        data: {
          label: concept.label,
          nodeStyle: {
            alignItems: "center",
            background: palette.bg,
            border: `1px solid ${isFocus ? "#111827" : palette.border}`,
            borderRadius: concept.id === "loneliness" ? 999 : 18,
            boxShadow: isFocus ? `0 0 0 8px ${palette.ring}, 0 22px 60px rgba(15,23,42,.18)` : "0 14px 34px rgba(15,23,42,.12)",
            color: palette.text,
            display: "flex",
            fontSize: concept.id === "loneliness" ? 19 : primaryIds.includes(concept.id) ? 14 : 12,
            fontWeight: concept.id === "loneliness" ? 800 : 700,
            justifyContent: "center",
            lineHeight: 1.18,
            minHeight: concept.id === "loneliness" ? 68 : primaryIds.includes(concept.id) ? 48 : 42,
            padding: concept.id === "loneliness" ? "20px 26px" : "13px 15px",
            textAlign: "center",
            width: concept.id === "loneliness" ? 190 : primaryIds.includes(concept.id) ? 178 : 154,
          },
        },
        className: clsx("graph-node", isFocus && "graph-node-focus", isHighlighted && "graph-node-highlight"),
        style: {
          opacity: searchId && !isHighlighted ? 0.2 : 1,
        },
      };
    });

  const edges: Edge[] = graphEdges
    .filter((edge) => visible.has(edge.source) && visible.has(edge.target))
    .map((edge, index) => {
      const isHighlighted = highlighted.has(edge.source) && highlighted.has(edge.target);
      return {
        id: `${edge.source}-${edge.target}-${index}`,
        source: edge.source,
        target: edge.target,
        animated: isHighlighted,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: isHighlighted ? "#2563eb" : "#94a3b8" },
        style: {
          stroke: isHighlighted ? "#2563eb" : "#cbd5e1",
          strokeWidth: isHighlighted ? 2.8 : 1.2,
          opacity: searchId && !isHighlighted ? 0.16 : 0.9,
        },
      };
    });

  return { nodes, edges, highlighted };
}

function ExplorerCanvas() {
  const [selectedId, setSelectedId] = useState("loneliness");
  const [query, setQuery] = useState("");
  const [searchId, setSearchId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(new Set<string>());
  const [demoStep, setDemoStep] = useState(-1);
  const [demoActive, setDemoActive] = useState(false);
  const explorerRef = useRef<HTMLElement | null>(null);
  const { fitView, setCenter } = useReactFlow();
  const selected = conceptById.get(selectedId) ?? conceptList[0];
  const revealedPath = useMemo(() => new Set(demoPath.slice(0, demoStep + 1)), [demoStep]);
  const { nodes, edges } = useMemo(() => buildGraph(selectedId, searchId, collapsed, revealedPath), [selectedId, searchId, collapsed, revealedPath]);

  const results = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];
    return conceptList
      .filter((concept) => `${concept.label} ${concept.category} ${concept.definition}`.toLowerCase().includes(clean))
      .slice(0, 8);
  }, [query]);

  const selectConcept = useCallback(
    (id: string, searched = false) => {
      const concept = conceptById.get(id);
      if (!concept) return;
      setSelectedId(id);
      setSearchId(searched ? id : null);
      if (!searched) setDemoStep(-1);
      const position = conceptPosition(concept);
      setTimeout(() => setCenter(position.x, position.y, { zoom: searched ? 1.15 : 0.95, duration: 650 }), 60);
    },
    [setCenter],
  );

  const focusConcept = useCallback(
    (id: string, zoom = 1.02) => {
      const concept = conceptById.get(id);
      if (!concept) return;
      setSelectedId(id);
      const position = conceptPosition(concept);
      setCenter(position.x, position.y, { zoom, duration: 780 });
    },
    [setCenter],
  );

  const runDemo = useCallback(async () => {
    if (demoActive) return;
    setDemoActive(true);
    setQuery("");
    setSearchId(null);
    explorerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setCollapsed(new Set(primaryIds));
    for (let index = 0; index < demoPath.length; index += 1) {
      const id = demoPath[index];
      setDemoStep(index);
      if (id === "belonging-loneliness") {
        setCollapsed((current) => {
          const next = new Set(current);
          next.delete("belonging-loneliness");
          return next;
        });
      }
      focusConcept(id, index === 0 ? 0.85 : 1.08);
      await new Promise((resolve) => setTimeout(resolve, index === 0 ? 850 : 1150));
    }
    setDemoActive(false);
  }, [demoActive, focusConcept]);

  useEffect(() => {
    const timer = setTimeout(() => fitView({ duration: 800, padding: 0.22 }), 120);
    return () => clearTimeout(timer);
  }, [fitView]);

  const related = getRelatedConcepts(selected.id);
  const intelligence = intelligenceFor(selected);

  return (
    <main className="min-h-screen p-4 text-slate-950 sm:p-7">
      <div className="mx-auto flex max-w-[1520px] flex-col gap-5">
        <header className="glass animate-fade-up rounded-[32px] px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                Intelligence Explorer
              </div>
              <h1 className="text-4xl font-black leading-none tracking-tight text-slate-950 sm:text-6xl">Loneliness Map</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                A research intelligence graph that turns loneliness from a questionnaire topic into an explorable system of needs, evidence, and interventions.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={runDemo}
                disabled={demoActive}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
              >
                <PlayCircle className="h-4 w-4" />
                {demoActive ? "Running demo" : "Demo path"}
              </button>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  [String(conceptList.length), "Concepts"],
                  [String(graphEdges.length), "Edges"],
                  ["6", "Lenses"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/80 bg-white/65 px-4 py-3 shadow-sm">
                    <div className="text-2xl font-black text-slate-950">{value}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section ref={explorerRef} className="grid min-h-[740px] scroll-mt-4 gap-5 xl:grid-cols-[300px_minmax(0,1fr)_420px]">
          <aside className="glass animate-fade-up rounded-[30px] p-5" style={{ animationDelay: "80ms" }}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for belonging, grief, stigma..."
                className="h-12 w-full rounded-2xl border border-white/80 bg-white/75 pl-10 pr-10 text-sm font-semibold outline-none ring-blue-500/20 transition focus:ring-4"
              />
              {query && (
                <button onClick={() => { setQuery(""); setSearchId(null); }} className="absolute right-3 top-3 text-slate-400 transition hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {results.map((concept) => (
                <button
                  key={concept.id}
                  onClick={() => selectConcept(concept.id, true)}
                  className="w-full rounded-2xl border border-white/80 bg-white/65 px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <div className="text-sm font-bold text-slate-900">{concept.label}</div>
                  <div className="text-xs font-semibold text-slate-500">{concept.category}</div>
                </button>
              ))}
              {query && results.length === 0 && (
                <div className="rounded-2xl border border-white/80 bg-white/60 px-3 py-4 text-sm leading-6 text-slate-600">
                  No direct match yet. Try a human signal such as <span className="font-bold text-slate-900">belonging</span>, <span className="font-bold text-slate-900">grief</span>, or <span className="font-bold text-slate-900">running club</span>.
                </div>
              )}
            </div>
            <div className="mt-6">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                <Layers3 className="h-4 w-4" />
                Graph layers
              </div>
              <div className="space-y-2">
                {primaryIds.map((id) => {
                  const concept = conceptById.get(id);
                  if (!concept) return null;
                  const isCollapsed = collapsed.has(id);
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setCollapsed((current) => {
                          const next = new Set(current);
                          if (next.has(id)) next.delete(id);
                          else next.add(id);
                          return next;
                        });
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/80 bg-white/55 px-3 py-3 text-left text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:bg-white"
                    >
                      {concept.label}
                      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="glass animate-fade-up overflow-hidden rounded-[32px]" style={{ animationDelay: "140ms" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => selectConcept(node.id)}
              minZoom={0.18}
              maxZoom={1.8}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#94a3b8" gap={22} size={1} />
              <Controls className="!rounded-2xl !border !border-white/80 !bg-white/75 !shadow-xl" />
              <MiniMap pannable zoomable nodeStrokeWidth={3} className="!rounded-2xl !border !border-white/80 !bg-white/70 !shadow-xl" />
            </ReactFlow>
          </div>

          <aside className="glass animate-fade-up overflow-hidden rounded-[30px]" style={{ animationDelay: "200ms" }}>
            <div key={`${selected.id}-header`} className="animate-side-panel border-b border-white/70 p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">{selected.category}</span>
                <Link href={`/concept/${selected.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900">
                  Concept page <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950">{selected.label}</h2>
              <p className="mt-4 text-[15px] leading-7 text-slate-600">{selected.definition}</p>
            </div>
            <div key={`${selected.id}-body`} className="animate-side-panel max-h-[640px] space-y-4 overflow-y-auto p-6">
              <PanelSection icon={<Brain />} title="Why It Matters" items={[intelligence.why]} />
              <PanelSection icon={<Network />} title="Evidence Signals" items={intelligence.evidenceSignals} />
              <PanelSection icon={<Target />} title="Possible Interventions" items={intelligence.interventions} />
              <div className="rounded-3xl border border-white/80 bg-white/58 p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-slate-500">Related Concepts</h3>
                <p className="mb-4 text-sm leading-6 text-slate-600">{intelligence.relatedConceptFrame}</p>
                <div className="flex flex-wrap gap-2">
                  {related.slice(0, 14).map((concept) => (
                    <button
                      key={concept.id}
                      onClick={() => selectConcept(concept.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      {concept.label}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function PanelSection({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <section className="rounded-3xl border border-white/80 bg-white/58 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
        <span className="text-blue-700 [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
        {title}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className={clsx("rounded-2xl bg-white/75 px-3 py-2 text-sm leading-6 text-slate-700", items.length === 1 && "font-medium")}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

export function IntelligenceExplorer() {
  return (
    <ReactFlowProvider>
      <ExplorerCanvas />
    </ReactFlowProvider>
  );
}
