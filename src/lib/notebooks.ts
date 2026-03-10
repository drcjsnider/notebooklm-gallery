import ogs from "open-graph-scraper";

import { isSupabaseConfigured } from "@/lib/config";
import { mockNotebooks } from "@/lib/mock-data";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { normalizeTags } from "@/lib/validation";

import type { Notebook } from "@/lib/types";

type NotebookInsert = {
  notebook_name: string;
  description: string;
  link: string;
  tags: string[];
  submitter_email: string;
  og_image_url: string | null;
  og_title: string | null;
  og_description: string | null;
  status: "approved";
  legal_confirmed: boolean;
};

type NotebookRow = {
  id: string;
  notebook_name: string;
  description: string;
  link: string;
  tags: string[] | null;
  submitter_email: string | null;
  og_image_url: string | null;
  og_title: string | null;
  og_description: string | null;
  status: Notebook["status"];
  legal_confirmed: boolean;
  created_at: string;
};

export function isLiveDataEnabled() {
  return isSupabaseConfigured();
}

function mapNotebook(row: NotebookRow): Notebook {
  return {
    id: row.id,
    notebookName: row.notebook_name,
    description: row.description,
    link: row.link,
    tags: row.tags ?? [],
    submitterEmail: row.submitter_email,
    ogImageUrl: row.og_image_url,
    ogTitle: row.og_title,
    ogDescription: row.og_description,
    status: row.status,
    legalConfirmed: row.legal_confirmed,
    createdAt: row.created_at,
  };
}

export async function getApprovedNotebooks() {
  if (!isSupabaseConfigured()) {
    return mockNotebooks;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notebooks")
    .select(
      "id, notebook_name, description, link, tags, submitter_email, og_image_url, og_title, og_description, status, legal_confirmed, created_at",
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load notebooks", error);
    return mockNotebooks;
  }

  return (data as NotebookRow[]).map(mapNotebook);
}

export async function createNotebook(input: {
  notebookName: string;
  description: string;
  link: string;
  tags: string;
  submitterEmail: string;
  legalConfirmed: boolean;
}) {
  const supabase = createSupabaseAdminClient();
  const ogData = await scrapeOpenGraph(input.link);

  const payload: NotebookInsert = {
    notebook_name: input.notebookName,
    description: input.description,
    link: input.link,
    tags: normalizeTags(input.tags),
    submitter_email: input.submitterEmail,
    og_image_url: ogData.imageUrl,
    og_title: ogData.title,
    og_description: ogData.description,
    status: "approved",
    legal_confirmed: input.legalConfirmed,
  };

  const { data, error } = await supabase
    .from("notebooks")
    .insert(payload)
    .select(
      "id, notebook_name, description, link, tags, submitter_email, og_image_url, og_title, og_description, status, legal_confirmed, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapNotebook(data as NotebookRow);
}

export async function createNotebookReport(input: {
  notebookId: string;
  reason: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("reports").insert({
    notebook_id: input.notebookId,
    reason: input.reason.trim(),
  });

  if (error) {
    throw error;
  }
}

export async function verifyNotebookVisibility(link: string) {
  let response: Response;

  try {
    response = await fetch(link, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "user-agent": "NotebookLM Gallery Validator/1.0",
        accept: "text/html,application/xhtml+xml",
      },
    });
  } catch {
    return {
      ok: false,
      message:
        "We could not reach that link. Double-check the URL and confirm the notebook is public.",
    };
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        message:
          "This notebook appears to require sign-in or special access. Submit a public NotebookLM link instead.",
      };
    }

    return {
      ok: false,
      message: `That link returned an error (${response.status}). Please submit a publicly viewable NotebookLM notebook.`,
    };
  }

  const html = (await response.text()).toLowerCase();
  const blockedMarkers = [
    "request access",
    "you need access",
    "permission denied",
    "private notebook",
  ];

  if (blockedMarkers.some((marker) => html.includes(marker))) {
    return {
      ok: false,
      message:
        "This notebook does not look public yet. Make sure anyone with the link can view it before submitting.",
    };
  }

  return { ok: true };
}

async function scrapeOpenGraph(link: string) {
  try {
    const result = await ogs({
      url: link,
      timeout: 10000,
      fetchOptions: {
        headers: {
          "user-agent": "NotebookLM Gallery Metadata Scraper/1.0",
        },
      },
    });

    if (result.error) {
      return {
        imageUrl: null,
        title: null,
        description: null,
      };
    }

    const ogImage = result.result.ogImage as
      | { url?: string }
      | Array<{ url?: string }>
      | undefined;
    const image = Array.isArray(ogImage) ? ogImage[0]?.url : ogImage?.url;

    return {
      imageUrl: image ?? null,
      title: result.result.ogTitle ?? null,
      description: result.result.ogDescription ?? null,
    };
  } catch {
    return {
      imageUrl: null,
      title: null,
      description: null,
    };
  }
}


