import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Database, Network, Search } from "lucide-react";
import { conceptById, conceptList, getRelatedConcepts, intelligenceFor } from "@/lib/graph";

export function generateStaticParams() {
  return conceptList.map((concept) => ({ id: concept.id }));
}

export default async function ConceptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const concept = conceptById.get(id);
  if (!concept) notFound();
  const related = getRelatedConcepts(concept.id);
  const intelligence = intelligenceFor(concept);

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white">
          <ArrowLeft className="h-4 w-4" />
          Back to explorer
        </Link>

        <section className="glass rounded-[32px] p-6 sm:p-8">
          <div className="mb-4 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
            {concept.category}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">{concept.label}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{concept.definition}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Database 1", "Structured JSON source", <Database key="database" />],
              ["Knowledge Graph", "Mapped relationships", <Network key="network" />],
              ["Search", "Direct highlight path", <Search key="search" />],
            ].map(([title, body, icon]) => (
              <div key={String(title)} className="rounded-3xl border border-white/80 bg-white/60 p-5 shadow-sm">
                <div className="mb-4 text-blue-700 [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
                <h2 className="font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="glass rounded-[28px] p-6">
            <h2 className="text-xl font-black text-slate-950">Intelligence Brief</h2>
            <div className="mt-4 space-y-4">
              <Brief title="Why it matters" items={[intelligence.why]} />
              <Brief title="Evidence signals" items={intelligence.evidenceSignals} />
              <Brief title="Possible interventions" items={intelligence.interventions} />
            </div>
          </div>

          <aside className="glass rounded-[28px] p-6">
            <h2 className="text-xl font-black text-slate-950">Connected Concepts</h2>
            <div className="mt-4 space-y-2">
              {related.map((item) => (
                <Link key={item.id} href={`/concept/${item.id}`} className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/65 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-white hover:text-blue-700">
                  {item.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Brief({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{title}</h3>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <p key={item} className="rounded-2xl bg-white/65 px-4 py-3 text-sm leading-6 text-slate-700">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
