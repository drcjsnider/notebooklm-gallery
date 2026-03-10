import { z } from "zod";

import type { SubmissionErrors, SubmissionPayload } from "@/lib/types";

export const MAX_DESCRIPTION_WORDS = 75;

export function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function normalizeTags(tagsInput: string) {
  return Array.from(
    new Set(
      tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

export const submissionSchema = z.object({
  notebookName: z.string().trim().min(1, "Notebook name is required."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .superRefine((value, ctx) => {
      if (countWords(value) > MAX_DESCRIPTION_WORDS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Description must be ${MAX_DESCRIPTION_WORDS} words or fewer.`,
        });
      }
    }),
  link: z.string().trim().url("Enter a valid NotebookLM URL."),
  tags: z.string().trim().min(1, "Add at least one tag."),
  submitterEmail: z.string().trim().email("Enter a valid email address."),
  legalConfirmed: z.boolean().refine((value) => value, {
    message: "You must confirm that you have the legal rights to share this content.",
  }),
});

export function validateNotebookLink(link: string) {
  try {
    const url = new URL(link);

    if (url.hostname !== "notebooklm.google.com") {
      return "Use a public NotebookLM link from notebooklm.google.com.";
    }

    if (!url.pathname.startsWith("/notebook/")) {
      return "The link must point to a public NotebookLM notebook page.";
    }

    return null;
  } catch {
    return "Enter a valid NotebookLM URL.";
  }
}

export function mapValidationErrors(
  error: z.ZodError<SubmissionPayload>,
): SubmissionErrors {
  const flattened = error.flatten().fieldErrors;

  return {
    notebookName: flattened.notebookName?.[0],
    description: flattened.description?.[0],
    link: flattened.link?.[0],
    tags: flattened.tags?.[0],
    submitterEmail: flattened.submitterEmail?.[0],
    legalConfirmed: flattened.legalConfirmed?.[0],
  };
}

