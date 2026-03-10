import type { Notebook } from "@/lib/types";

export const mockNotebooks: Notebook[] = [
  {
    id: "sample-industrial-policy",
    notebookName: "Industrial Policy 2026 Briefing",
    description:
      "A structured NotebookLM deep dive comparing industrial policy strategies across the U.S., EU, and East Asia, with audio summaries and source-backed policy notes.",
    link: "https://notebooklm.google.com/notebook/sample-industrial-policy",
    tags: ["policy", "economics", "audio"],
    submitterEmail: null,
    ogImageUrl: null,
    ogTitle: "Industrial Policy 2026 Briefing",
    ogDescription:
      "Comparative research on how major economies are using subsidies, standards, and strategic investment.",
    status: "approved",
    legalConfirmed: true,
    createdAt: new Date("2026-03-01").toISOString(),
  },
  {
    id: "sample-climate-grid",
    notebookName: "Climate Grid Resilience Notes",
    description:
      "Curated NotebookLM notebook covering transmission bottlenecks, storage economics, and resilience planning with concise takeaways for analysts and operators.",
    link: "https://notebooklm.google.com/notebook/sample-climate-grid",
    tags: ["energy", "climate", "research"],
    submitterEmail: null,
    ogImageUrl: null,
    ogTitle: "Climate Grid Resilience Notes",
    ogDescription:
      "Research notebook on energy transition risk, resilience, and grid modernization.",
    status: "approved",
    legalConfirmed: true,
    createdAt: new Date("2026-03-03").toISOString(),
  },
  {
    id: "sample-biotech-roundup",
    notebookName: "Biotech Signals Weekly",
    description:
      "A public NotebookLM notebook that synthesizes recent biotech filings, trial readouts, and company commentary into one searchable research companion.",
    link: "https://notebooklm.google.com/notebook/sample-biotech-roundup",
    tags: ["biotech", "markets", "weekly"],
    submitterEmail: null,
    ogImageUrl: null,
    ogTitle: "Biotech Signals Weekly",
    ogDescription:
      "Weekly synthesis of biotech filings, catalysts, and management commentary.",
    status: "approved",
    legalConfirmed: true,
    createdAt: new Date("2026-03-06").toISOString(),
  },
];
