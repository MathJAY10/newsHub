export async function summarizeWithGemini(text: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in env variables");
  }

  const prompt = `
Summarize the following text into a structured news summary with headings:
1. Headline / Title
2. Key Events / News Highlights
3. Political Updates
4. Economic Updates
5. International Relations
6. Miscellaneous / Other Important Notes

Text:
${text}
`;

  try {
    const res = await fetch(
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
            maxOutputTokens: 5500,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API response error:", errText);
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();

    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Summary not available";
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in summarizeWithGemini:", error.message);
    } else {
      console.error("Unexpected error in summarizeWithGemini:", error);
    }
    return "Summary could not be generated due to an error.";
  }
}
