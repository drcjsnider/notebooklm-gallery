import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("notebooks.submit", { timeout: 15000 }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated requests", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    try {
      await caller.notebooks.submit({
        name: "Test Notebook",
        description: "A test notebook",
        link: "https://notebooklm.google.com/test",
        tags: [],
      });
      expect.fail("Should have thrown UNAUTHORIZED error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should validate required fields", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Test missing name
    try {
      await caller.notebooks.submit({
        name: "",
        description: "A test notebook",
        link: "https://notebooklm.google.com/test",
        tags: [],
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should validate description length", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const longDescription = "a".repeat(251);

    try {
      await caller.notebooks.submit({
        name: "Test Notebook",
        description: longDescription,
        link: "https://notebooklm.google.com/test",
        tags: [],
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should validate URL format", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.notebooks.submit({
        name: "Test Notebook",
        description: "A test notebook",
        link: "not-a-valid-url",
        tags: [],
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should accept valid input with tags", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notebooks.submit({
      name: "AI Ethics Deep Dive",
      description: "A comprehensive exploration of ethical considerations in artificial intelligence development and deployment.",
      link: "https://notebooklm.google.com/test",
      tags: ["AI", "Ethics", "Research"],
    });

    expect(result).toEqual({ success: true });
  });

  it("should accept valid input without tags", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notebooks.submit({
      name: "Machine Learning Basics",
      description: "An introduction to fundamental machine learning concepts and algorithms.",
      link: "https://notebooklm.google.com/test",
      tags: [],
    });

    expect(result).toEqual({ success: true });
  });
});
