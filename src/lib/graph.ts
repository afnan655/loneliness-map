import concepts from "@/data/concepts.json";
import edges from "@/data/edges.json";

export type Concept = {
  id: string;
  label: string;
  category: string;
  definition: string;
};

export type GraphEdge = {
  source: string;
  target: string;
};

export const conceptList = concepts as Concept[];
export const graphEdges = edges as GraphEdge[];

export const conceptById = new Map(conceptList.map((concept) => [concept.id, concept]));

export function getConnectedIds(id: string) {
  const connected = new Set<string>();
  graphEdges.forEach((edge) => {
    if (edge.source === id) connected.add(edge.target);
    if (edge.target === id) connected.add(edge.source);
  });
  return connected;
}

export function getRelatedConcepts(id: string) {
  return Array.from(getConnectedIds(id))
    .map((relatedId) => conceptById.get(relatedId))
    .filter(Boolean) as Concept[];
}

export function intelligenceFor(concept: Concept) {
  const category = concept.category.toLowerCase();
  const lowerLabel = concept.label.toLowerCase();
  const categoryBriefs: Record<string, { why: string; signals: string[]; interventions: string[] }> = {
    core: {
      why: "Loneliness is the root condition the platform models: not a single feeling, but a network of social, emotional, identity, purpose, and existential needs that can be explored and acted on.",
      signals: ["UCLA-style loneliness scales and qualitative intake notes", "Network size, contact frequency, and perceived support", "Movement from broad distress to a specific connected need"],
      interventions: ["Route people from the broad problem to a precise loneliness pathway", "Track which connected concepts change after support", "Use the graph as the foundation for a future decision engine"],
    },
    "primary dimension": {
      why: `${concept.label} is a strategic lens. It helps teams classify a person's loneliness pattern before choosing programs, partners, or research evidence.`,
      signals: ["Language used in intake conversations and journal prompts", "Which connected concepts appear together in a person's story", "Shifts in belonging, support, mattering, and confidence over time"],
      interventions: ["Open the connected branch and identify the nearest actionable concept", "Match the person to a lightweight first step before a high-commitment program", "Measure whether the intervention changes adjacent graph signals"],
    },
    social: {
      why: `${concept.label} matters because social loneliness often improves through repeated low-pressure contact, not one-off advice or abstract encouragement.`,
      signals: ["Number of recurring touchpoints per week", "Follow-through after invitations, events, or introductions", "Reported ease of initiating and sustaining contact"],
      interventions: ["Warm introductions into repeatable local activities", "Third-place discovery, small group onboarding, and reminder loops", "Conversation prompts that lower the first-interaction barrier"],
    },
    emotional: {
      why: `${concept.label} points to the quality of closeness. Someone may have people around them and still feel emotionally alone if trust, safety, or vulnerability is missing.`,
      signals: ["Presence of at least one trusted confidant", "Ability to name feelings and ask for support", "Patterns of avoidance, shame, unresolved conflict, or grief"],
      interventions: ["Guided reflection before outreach", "Peer support, therapy referral, or structured repair conversations", "Small disclosure exercises that rebuild trust gradually"],
    },
    belonging: {
      why: `${concept.label} is where loneliness becomes visibly solvable: people need places, rituals, and groups that make participation feel natural enough to repeat.`,
      signals: ["Attendance that becomes habit rather than a single event", "Recognition by name, role, or contribution inside a group", "Movement from outsider status to mutual expectation"],
      interventions: ["Recurring groups such as running clubs, hobby circles, faith communities, or volunteering teams", "Inclusive onboarding and buddy systems", "Visible rituals that help people know how to enter and return"],
    },
    purpose: {
      why: `${concept.label} connects loneliness to usefulness, agency, and future direction. People often reconnect when they can contribute and see that contribution matter.`,
      signals: ["Clarity of goals, roles, and next steps", "Evidence that effort helped another person or community", "Consistency of daily structure and self-directed action"],
      interventions: ["Service pathways matched to capacity", "Mentorship, skill-building, and contribution loops", "Feedback that makes impact visible quickly"],
    },
    "identity barrier": {
      why: `${concept.label} surfaces the barriers that make connection unsafe or inaccessible. Without this layer, interventions can unintentionally ask people to enter spaces built against them.`,
      signals: ["Avoidance caused by stigma, access, cost, language, or safety concerns", "Reports of masking, tokenization, or identity threat", "Drop-off at moments where environments fail to include people"],
      interventions: ["Safer access design and representation", "Culturally competent partners and language support", "Reduce cost, transport, sensory, or stigma friction before asking for participation"],
    },
    existential: {
      why: `${concept.label} captures loneliness that is not solved by more contacts alone. It asks whether suffering, mortality, meaning, and selfhood have somewhere to be held.`,
      signals: ["Questions about meaning, mortality, freedom, or identity continuity", "Difficulty distinguishing restorative solitude from isolation", "Need for grief, awe, ritual, or reflection"],
      interventions: ["Rituals, nature connection, narrative reflection, and philosophical counseling", "Spaces where pain can be witnessed without being rushed", "Meaning-making practices that connect the person to something larger"],
    },
    "research layer": {
      why: `${concept.label} is the credibility layer. It shows investors and partners that the map can connect lived experience to evidence, outcomes, and product decisions.`,
      signals: ["Validated scales, published studies, and program evaluations", "Pre/post change in connected graph concepts", "Evidence quality, population fit, and implementation cost"],
      interventions: ["Attach research artifacts to concepts and edges", "Compare programs by evidence strength and outcome fit", "Turn the graph into a decision engine for recommendations"],
    },
  };

  const brief = categoryBriefs[category] ?? categoryBriefs.social;

  return {
    why: brief.why,
    evidenceSignals: brief.signals,
    relatedConceptFrame: `Explore concepts directly connected to ${lowerLabel}; these are the nearest explanations, blockers, and intervention routes in the graph.`,
    interventions: brief.interventions,
  };
}

export const categoryColors: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  Core: { bg: "#111827", border: "#111827", text: "#ffffff", ring: "rgba(17, 24, 39, 0.22)" },
  "Primary Dimension": { bg: "#2563eb", border: "#1d4ed8", text: "#ffffff", ring: "rgba(37, 99, 235, 0.24)" },
  Social: { bg: "#e0f2fe", border: "#38bdf8", text: "#075985", ring: "rgba(56, 189, 248, 0.24)" },
  Emotional: { bg: "#ffe4e6", border: "#fb7185", text: "#9f1239", ring: "rgba(251, 113, 133, 0.24)" },
  Belonging: { bg: "#dcfce7", border: "#22c55e", text: "#166534", ring: "rgba(34, 197, 94, 0.24)" },
  Purpose: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e", ring: "rgba(245, 158, 11, 0.24)" },
  "Identity Barrier": { bg: "#ede9fe", border: "#8b5cf6", text: "#5b21b6", ring: "rgba(139, 92, 246, 0.24)" },
  Existential: { bg: "#e5e7eb", border: "#64748b", text: "#334155", ring: "rgba(100, 116, 139, 0.24)" },
  "Research Layer": { bg: "#ccfbf1", border: "#14b8a6", text: "#115e59", ring: "rgba(20, 184, 166, 0.24)" },
};
