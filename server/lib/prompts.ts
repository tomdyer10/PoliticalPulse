export function generatePrompt(topic: string) {
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
      "agreement": "Percentage of agreement (0-100)",
      "demographic": "Which demographic group this represents"
    }
  ]
}

Generate 4-6 diverse personas and 5-7 relevant survey questions. Ensure the analysis is balanced, data-driven, and considers multiple viewpoints.`;
}
