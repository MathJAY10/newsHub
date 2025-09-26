// lib/ai.ts
export async function summarizeWithGemini(text: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in env variables");
  }

  // Construct prompt
  const prompt = `
Summarize the following text into a structured news summary with headings:
1. Headline / Title
2. Key Events / News Highlights
3. Political Updates
4. Economic Updates
5. International Relations
6. Miscellaneous / Other Important Notes

Use bullet points where appropriate.

Text:
${text}
`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 5500, // increased to handle longer text
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API response error:", errText);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!summary) {
      console.warn("Gemini returned empty summary, returning fallback text");
      return "Summary not available for this text.";
    }

    return summary;
  } catch (error: any) {
    console.error("Error in summarizeWithGemini:", error);
    return "Summary could not be generated due to an error.";
  }
}
