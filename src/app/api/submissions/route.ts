import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/config";
import { createNotebook, verifyNotebookVisibility } from "@/lib/notebooks";
import {
  mapValidationErrors,
  submissionSchema,
  validateNotebookLink,
} from "@/lib/validation";

import type { SubmissionPayload, SubmissionResponse } from "@/lib/types";

type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

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
    console.error("Notebook submission save failed", error);

    const databaseError = normalizeDatabaseError(error);

    if (databaseError.code === "23505") {
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

    if (databaseError.code === "42P01") {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          message:
            "The notebooks table is missing in Supabase. Run the SQL in supabase/schema.sql and try again.",
        },
        { status: 500 },
      );
    }

    if (databaseError.code === "42703") {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          message:
            "Your Supabase notebooks table is missing one of the expected columns. Re-run the latest supabase/schema.sql and try again.",
        },
        { status: 500 },
      );
    }

    if (databaseError.code === "42501") {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          message:
            "Supabase rejected the save request. Check that Vercel is using the current SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json<SubmissionResponse>(
      {
        success: false,
        message: formatDatabaseMessage(databaseError),
      },
      { status: 500 },
    );
  }
}

function normalizeDatabaseError(error: unknown): SupabaseLikeError {
  if (typeof error === "object" && error !== null) {
    return error as SupabaseLikeError;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: String(error),
  };
}

function formatDatabaseMessage(error: SupabaseLikeError) {
  const message = error.message?.trim();
  const details = error.details?.trim();

  if (message && details) {
    return `Supabase could not save this notebook: ${message}. ${details}`;
  }

  if (message) {
    return `Supabase could not save this notebook: ${message}`;
  }

  return "The notebook passed validation, but we could not save it right now. Please try again.";
}
