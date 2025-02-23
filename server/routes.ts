import type { Express } from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { generatePollAnalysis, answerAnalysisQuestion } from "./lib/openai";
import { z } from "zod";
import type { AnalysisStep } from "@shared/schema";

const createPollSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

const askQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
});

export async function registerRoutes(app: Express) {
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'subscribe' && data.pollId) {
          ws.pollId = data.pollId;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });

  // Broadcast analysis steps to subscribed clients
  function broadcastAnalysisStep(pollId: number, step: AnalysisStep) {
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ 
        type: 'analysisStep', 
        step,
        pollId: pollId 
      }));
    });
  }

  app.post("/api/polls", async (req, res) => {
    try {
      const { prompt } = createPollSchema.parse(req.body);
      const analysis = await generatePollAnalysis(prompt, (step) => {
        broadcastAnalysisStep(res.locals.pollId, step);
      });
      const poll = await storage.createPoll({
        ...analysis,
        prompt,
        createdAt: new Date().toISOString(),
      });
      res.json(poll);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: error.message });
      } else if (error.message.includes("API call limit reached")) {
        res.status(429).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.get("/api/polls/:id", async (req, res) => {
    try {
      const poll = await storage.getPoll(parseInt(req.params.id));
      if (!poll) {
        res.status(404).json({ message: "Poll not found" });
        return;
      }
      res.json(poll);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/polls/:id/ask", async (req, res) => {
    try {
      const { question } = askQuestionSchema.parse(req.body);
      const poll = await storage.getPoll(parseInt(req.params.id));

      if (!poll) {
        res.status(404).json({ message: "Poll not found" });
        return;
      }

      const answer = await answerAnalysisQuestion(question, {
        topic: poll.topic,
        summary: poll.summary,
        personas: poll.personas,
        questions: poll.questions,
        followupResponses: poll.followupResponses,
      });

      res.json({ answer });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: error.message });
      } else if (error.message.includes("API call limit reached")) {
        res.status(429).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  return server;
}