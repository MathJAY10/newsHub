import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function summarizeWithGemini(text: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in env variables");
  }

  try {
    const response = await client.chat.completions.create({
      model: "gemini-1.5",  // or your desired Gemini model
      messages: [
        {
          role: "user",
          content: `Please summarize the following text in concise paragraphs:\n\n${text}`,
        },
      ],
      temperature: 0.5,
    });

    const summary = response.choices?.[0]?.message?.content ?? "";
    return summary;
  } catch (err) {
    console.error("Gemini API error:", err);
    throw new Error("Failed to generate summary");
  }
}
