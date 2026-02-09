import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createNotebook, getAllNotebooks, searchNotebooks, createReport, getNotebookById, getReportCount } from "./db";
import { TRPCError } from "@trpc/server";
import { scrapeOpenGraph } from "./og-scraper";
import { enhanceNotebookContent } from "./llm-enhance";
import { notifyNewNotebook, notifyNewReport } from "./email-notifier";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  notebooks: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          description: z.string().min(1, "Description is required").max(250, "Description must be 250 characters or less"),
          link: z.string().url("Invalid URL"),
          tags: z.array(z.string()).default([]),
          submitterName: z.string().optional().default("Anonymous"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Scrape OG metadata from the link
          const { image: ogImage, metadata: ogMetadata } = await scrapeOpenGraph(input.link);

          // Enhance description and suggest tags using LLM
          const { enhancedDescription, suggestedTags } = await enhanceNotebookContent(
            input.name,
            input.description,
            ogMetadata as Record<string, unknown>
          );

          // Combine user tags with suggested tags
          const allTags = Array.from(new Set([...input.tags, ...suggestedTags]));

          // Use authenticated user ID if available, otherwise use null for public submissions
          const userId = ctx.user?.id || null;

          const result = await createNotebook(userId, {
            name: input.name,
            description: input.description,
            link: input.link,
            tags: allTags,
            ogImage,
            ogMetadata: ogMetadata as Record<string, unknown>,
            enhancedDescription,
            suggestedTags,
          });

          // Send notification to owner
          const submitterName = input.submitterName || ctx.user?.name || "Anonymous";
          await notifyNewNotebook(
            input.name,
            submitterName,
            input.link,
            input.description
          );

          return { success: true };
        } catch (error) {
          console.error("Failed to create notebook:", error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to submit notebook",
          });
        }
      }),

    list: publicProcedure.query(async () => {
      return await getAllNotebooks();
    }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await searchNotebooks(input.query);
      }),

    report: publicProcedure
      .input(
        z.object({
          notebookId: z.number(),
          reason: z.string().min(10, "Reason must be at least 10 characters"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await createReport(input.notebookId, null, input.reason);

          // Get notebook details for notification
          const notebook = await getNotebookById(input.notebookId);
          if (notebook) {
            const reportCount = await getReportCount(input.notebookId);
            // Send notification to owner
            await notifyNewReport(notebook.name, input.reason, reportCount);
          }

          return { success: true };
        } catch (error) {
          console.error("Failed to create report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit report",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
