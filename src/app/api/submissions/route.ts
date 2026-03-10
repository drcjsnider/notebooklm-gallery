import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/config";
import { createNotebook, verifyNotebookVisibility } from "@/lib/notebooks";
import {
  mapValidationErrors,
  submissionSchema,
  validateNotebookLink,
} from "@/lib/validation";

import type { SubmissionPayload, SubmissionResponse } from "@/lib/types";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json<SubmissionResponse>(
      {
        success: false,
        message:
          "Live submissions are not enabled yet. Add Supabase environment variables to continue.",
      },
      { status: 503 },
    );
  }

  let body: SubmissionPayload;

  try {
    body = (await request.json()) as SubmissionPayload;
  } catch {
    return NextResponse.json<SubmissionResponse>(
      {
        success: false,
        message: "We could not read that submission. Please try again.",
      },
      { status: 400 },
    );
  }

  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<SubmissionResponse>(
      {
        success: false,
        message: "Please fix the highlighted fields and try again.",
        errors: mapValidationErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  const linkError = validateNotebookLink(parsed.data.link);

  if (linkError) {
    return NextResponse.json<SubmissionResponse>(
      {
        success: false,
        message: linkError,
        errors: {
          link: linkError,
        },
      },
      { status: 400 },
    );
  }

  const visibility = await verifyNotebookVisibility(parsed.data.link);

  if (!visibility.ok) {
    return NextResponse.json<SubmissionResponse>(
      {
        success: false,
        message: visibility.message,
        errors: {
          link: visibility.message,
        },
      },
      { status: 400 },
    );
  }

  try {
    await createNotebook(parsed.data);

    return NextResponse.json<SubmissionResponse>({
      success: true,
      message:
        "Success. Your notebook passed the public access check and is now live in the gallery.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error);

    if (message.includes("duplicate") || message.includes("notebooks_link_key")) {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          message: "That notebook has already been submitted.",
          errors: {
            link: "This public notebook is already in the gallery.",
          },
        },
        { status: 409 },
      );
    }

    return NextResponse.json<SubmissionResponse>(
      {
        success: false,
        message:
          "The notebook passed validation, but we could not save it right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
