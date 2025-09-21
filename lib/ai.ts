// lib/ai.ts
export async function summarizeWithGemini(text: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in env variables");
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `Please summarize the following text concisely:\n\n${text}` }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API response:", errText);
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();

    // Gemini v2 returns output under data[0].content[0].text
    const summary = data?.[0]?.content?.[0]?.text ?? "";

    return summary;
  } catch (err) {
    console.error("Gemini API error:", err);
    throw new Error("Failed to generate summary");
  }
}
