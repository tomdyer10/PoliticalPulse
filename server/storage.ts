import type { Poll, InsertPoll } from "@shared/schema";
import { polls } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createPoll(poll: InsertPoll & { createdAt: string }): Promise<Poll>;
  getPoll(id: number): Promise<Poll | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createPoll(insertPoll: InsertPoll & { createdAt: string }): Promise<Poll> {
    const [poll] = await db
      .insert(polls)
      .values(insertPoll)
      .returning();
    return poll;
  }

  async getPoll(id: number): Promise<Poll | undefined> {
    const [poll] = await db.select().from(polls).where(eq(polls.id, id));
    return poll || undefined;
  }
}

export const storage = new DatabaseStorage();