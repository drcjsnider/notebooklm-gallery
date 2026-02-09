import { eq } from "drizzle-orm";
import { notebooks, reports } from "../drizzle/schema";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createNotebook(
  userId: number | null,
  data: {
    name: string;
    description: string;
    link: string;
    tags: string[];
    ogImage?: string | null;
    ogMetadata?: Record<string, unknown> | null;
    enhancedDescription?: string | null;
    suggestedTags?: string[] | null;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(notebooks).values({
    userId,
    name: data.name,
    description: data.description,
    link: data.link,
    tags: data.tags,
    ogImage: data.ogImage,
    ogMetadata: data.ogMetadata,
    enhancedDescription: data.enhancedDescription,
    suggestedTags: data.suggestedTags,
  });

  return result;
}

export async function getAllNotebooks() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(notebooks).orderBy(notebooks.createdAt);
}

export async function searchNotebooks(query: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  // Simple search by name or tags
  const allNotebooks = await db.select().from(notebooks);
  const lowerQuery = query.toLowerCase();

  return allNotebooks.filter(
    (nb) =>
      nb.name.toLowerCase().includes(lowerQuery) ||
      nb.description.toLowerCase().includes(lowerQuery) ||
      nb.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
  );
}

export async function createReport(
  notebookId: number,
  userId: number | null,
  reason: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.insert(reports).values({
    notebookId,
    userId,
    reason,
    status: "pending",
  });
}

export async function getNotebookById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(notebooks)
    .where(eq(notebooks.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getReportCount(notebookId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  const result = await db
    .select()
    .from(reports)
    .where(eq(reports.notebookId, notebookId));

  return result.length;
}
