import OpenAI from "openai";
import type { Persona, SurveyQuestion, FollowupResponse, AnalysisStep } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Rate limiting implementation
let apiCallCount = 0;
const API_CALL_LIMIT = 50; // Increased from 30 to 50

function checkRateLimit() {
  if (apiCallCount >= API_CALL_LIMIT) {
    throw new Error("API call limit reached (50 calls). Please try again later.");
  }
  apiCallCount++;
}

export async function generatePollAnalysis(
  prompt: string,
  onStep?: (step: AnalysisStep) => void
) {
  try {
    checkRateLimit();

    // Report planning step
    const planningStep: AnalysisStep = {
      type: "planning",
      message: "Analyzing the topic and planning the survey structure...",
      timestamp: new Date().toISOString(),
    };
    onStep?.(planningStep);

    // Small delay to show thinking process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Report questions step
    const questionsStep: AnalysisStep = {
      type: "questions",
      message: "Formulating 10 comprehensive survey questions to explore the topic...",
      timestamp: new Date().toISOString(),
    };
    onStep?.(questionsStep);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Report personas step
    const personasStep: AnalysisStep = {
      type: "personas",
      message: "Creating diverse voter profiles and analyzing their detailed perspectives...",
      timestamp: new Date().toISOString(),
    };
    onStep?.(personasStep);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a political polling expert that generates detailed survey analysis.",
        },
        {
          role: "user",
          content: generatePrompt(prompt),
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Report completion
    const completeStep: AnalysisStep = {
      type: "complete",
      message: "Analysis complete! Generating comprehensive report with expanded survey data...",
      timestamp: new Date().toISOString(),
    };
    onStep?.(completeStep);

    return {
      topic: result.topic,
      prompt,
      summary: result.summary,
      personas: result.personas as Persona[],
      questions: result.questions as SurveyQuestion[],
      followupResponses: result.followupResponses as FollowupResponse[],
      analysisSteps: [planningStep, questionsStep, personasStep, completeStep],
    };
  } catch (error: any) {
    if (error.message.includes("API call limit reached")) {
      throw error;
    }
    throw new Error("Failed to generate poll analysis: " + error.message);
  }
}

export async function answerAnalysisQuestion(
  question: string,
  pollData: {
    topic: string;
    summary: string;
    personas: Persona[];
    questions: SurveyQuestion[];
    followupResponses: FollowupResponse[];
  }
) {
  try {
    checkRateLimit();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a political polling expert. Answer questions about the poll analysis in a clear and concise way. Base your answers only on the provided poll data.",
        },
        {
          role: "user",
          content: `Here is the poll data:
Topic: ${pollData.topic}
Summary: ${pollData.summary}
Personas: ${JSON.stringify(pollData.personas, null, 2)}
Questions: ${JSON.stringify(pollData.questions, null, 2)}
Follow-up Responses: ${JSON.stringify(pollData.followupResponses, null, 2)}

Question: ${question}`,
        },
      ],
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response.";
  } catch (error: any) {
    if (error.message.includes("API call limit reached")) {
      throw error;
    }
    throw new Error("Failed to answer analysis question: " + error.message);
  }
}

function generatePrompt(topic: string) {
  return `Analyze the following political topic and generate a detailed survey simulation: "${topic}"

Please provide a JSON response in the following format:
{
  "topic": "A clear, concise title for the analysis",
  "summary": "A detailed 2-3 paragraph analysis of the survey results, including key findings and trends",
  "personas": [
    {
      "demographic": "Label for this demographic group",
      "age": "Age range",
      "location": "Geographic location",
      "background": "Socioeconomic and educational background",
      "views": "Summary of their views on the topic"
    }
  ],
  "questions": [
    {
      "question": "The survey question",
      "agreement": "Average percentage of agreement across all demographics (0-100)",
      "demographic": "Summarized view across demographics",
      "responses": [
        {
          "demographic": "Which demographic group this represents",
          "agreement": "Percentage for this specific demographic (0-100)",
          "reasoning": "Brief explanation of their stance"
        }
      ]
    }
  ],
  "followupResponses": [
    {
      "demographic": "Which demographic group this represents",
      "question": "A thoughtful follow-up question based on their views",
      "response": "A detailed personal response from this demographic's perspective, including their reasoning and experiences"
    }
  ]
}

Important requirements:
1. Generate exactly 10 survey questions
2. For each question, provide specific responses from EVERY persona
3. Generate exactly 2 follow-up responses for EACH persona
4. Ensure each persona's views are well-reasoned and consistent across their responses
5. Make sure follow-up questions are unique and relevant to each persona's background

Generate 4-6 diverse personas, and ensure the analysis is balanced, data-driven, and considers multiple viewpoints. The follow-up responses should be detailed and reflect each persona's background and perspective.`;
}