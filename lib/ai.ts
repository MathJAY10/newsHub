// lib/ai.ts
export async function summarizeWithGemini(text: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in env variables");
  }

  try {
    console.log("[Gemini] Starting summary request. Input length:", text.length);

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
              parts: [
                {
                  text: `Please summarize the following text concisely:\n\n${text}`,
                },
              ],
            },
          ],
        }),
      }
    );

    // --- Debug: log status and headers
    console.log("[Gemini] HTTP status:", response.status);
    if (!response.ok) {
      const errText = await response.text();
      console.error("[Gemini] API error response:", errText);
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    console.log("[Gemini] Raw response keys:", Object.keys(data));

    // ✅ Correct extraction for Gemini response
    const summary =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    console.log("[Gemini] Extracted summary length:", summary.length);

    if (!summary) {
      throw new Error("Gemini returned an empty summary string");
    }

    return summary;
  } catch (err: any) {
    console.error("[Gemini] Exception:", err.message || err);
    throw new Error("Failed to generate summary");
  }
}
