import { NextResponse } from "next/server";
import { z } from "zod";

import { isSupabaseConfigured } from "@/lib/config";
import { createNotebookReport } from "@/lib/notebooks";

import type { ReportResponse } from "@/lib/types";

const reportSchema = z.object({
  notebookId: z.string().trim().min(1),
  reason: z.string().trim().min(1, "Please provide a reason for the report."),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json<ReportResponse>(
      {
        success: false,
        message: "Live reporting is not enabled yet.",
      },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ReportResponse>(
      {
        success: false,
        message: "We could not read that report request.",
      },
      { status: 400 },
    );
  }

  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ReportResponse>(
      {
        success: false,
        message: "Please add a reason for this report.",
        errors: {
          reason: parsed.error.flatten().fieldErrors.reason?.[0],
        },
      },
      { status: 400 },
    );
  }

  try {
    await createNotebookReport(parsed.data);

    return NextResponse.json<ReportResponse>({
      success: true,
      message: "Thank you. Your report has been saved for admin review.",
    });
  } catch {
    return NextResponse.json<ReportResponse>(
      {
        success: false,
        message: "We could not save that report right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
