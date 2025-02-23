import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  prompt: text("prompt").notNull(),
  summary: text("summary").notNull(),
  personas: jsonb("personas").$type<Persona[]>().notNull(),
  questions: jsonb("questions").$type<SurveyQuestion[]>().notNull(),
  followupResponses: jsonb("followup_responses").$type<FollowupResponse[]>().notNull().default([]),
  createdAt: text("created_at").notNull(),
  analysisSteps: jsonb("analysis_steps").$type<AnalysisStep[]>().notNull().default([]),
});

export type Persona = {
  demographic: string;
  age: string;
  location: string;
  background: string;
  views: string;
};

export type DemographicResponse = {
  demographic: string;
  agreement: number;
  reasoning: string;
};

export type SurveyQuestion = {
  question: string;
  agreement: number;
  demographic: string;
  responses: DemographicResponse[];
};

export type FollowupResponse = {
  demographic: string;
  question: string;
  response: string;
};

export type AnalysisStep = {
  type: "planning" | "questions" | "personas" | "complete";
  message: string;
  timestamp: string;
};

export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  createdAt: true,
});

export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Poll = typeof polls.$inferSelect;