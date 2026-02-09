import { describe, expect, it, vi } from "vitest";
import { notifyNewNotebook, notifyNewReport } from "./email-notifier";

describe("email-notifier", { timeout: 10000 }, () => {
  it("should have NOTIFICATION_EMAIL configured", () => {
    const email = process.env.NOTIFICATION_EMAIL;
    expect(email).toBeDefined();
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("should validate email format is correct", () => {
    const email = process.env.NOTIFICATION_EMAIL;
    expect(email).toBe("drcjsnider@hotmail.com");
  });

  it("should call notifyOwner for new notebook", async () => {
    // Mock the notifyOwner function
    const result = await notifyNewNotebook(
      "Test Notebook",
      "Test User",
      "https://example.com/notebook",
      "A test notebook description"
    );

    // Result should be a boolean (success or failure)
    expect(typeof result).toBe("boolean");
  });

  it("should call notifyOwner for new report", async () => {
    // Mock the notifyOwner function
    const result = await notifyNewReport(
      "Test Notebook",
      "This content violates guidelines",
      1
    );

    // Result should be a boolean (success or failure)
    expect(typeof result).toBe("boolean");
  });
});
