import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("notebooks.report", { timeout: 15000 }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject reports with short reasons", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.notebooks.report({
        notebookId: 1,
        reason: "Bad",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should accept valid report with sufficient reason length", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notebooks.report({
      notebookId: 1,
      reason: "This notebook contains inappropriate content and violates community guidelines.",
    });

    expect(result).toEqual({ success: true });
  });

  it("should accept reports from unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notebooks.report({
      notebookId: 1,
      reason: "This content appears to be spam and does not meet quality standards.",
    });

    expect(result).toEqual({ success: true });
  });
});
