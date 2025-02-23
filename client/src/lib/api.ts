import { apiRequest } from "./queryClient";
import type { Poll } from "@shared/schema";

export async function createPoll(prompt: string): Promise<Poll> {
  const res = await apiRequest("POST", "/api/polls", { prompt });
  return res.json();
}

export async function getPoll(id: number): Promise<Poll> {
  const res = await apiRequest("GET", `/api/polls/${id}`);
  return res.json();
}
