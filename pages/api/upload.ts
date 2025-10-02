import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import { prisma } from "@/lib/prisma";
import { extractTextFromPDF, generateSummaryPDF } from "@/lib/pdf";
import { summarizeWithGemini } from "@/lib/ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export const config = { api: { bodyParser: false } };
const MAX_INPUT_CHARS = 3000;

// --- Extend globalThis for progress tracking ---
declare global {
  var ocrProgress: { [key: string]: number };
}

// Ensure ocrProgress exists
globalThis.ocrProgress = globalThis.ocrProgress || {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // 1️⃣ Check user session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ error: "User not logged in" });
    const userId = session.user.id;

    // 2️⃣ Generate jobId and initialize progress
    const jobId = uuidv4();
    globalThis.ocrProgress[jobId] = 0;

    // 3️⃣ Parse uploaded PDF
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files: any) => {
      if (err) return res.status(500).json({ error: err.message });

      const singleFile: File | undefined = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!singleFile) return res.status(400).json({ error: "No file uploaded" });

      const pdfPath = (singleFile as any).filepath ?? (singleFile as any).path;
      const pdfName = (singleFile as any).originalFilename ?? "uploaded-file.pdf";

      // Immediately respond with jobId for frontend polling
      res.status(202).json({ jobId });

      try {
        // Step 1: Extract text (OCR fallback if needed)
        globalThis.ocrProgress[jobId] = 20;
        const fullText = await extractTextFromPDF(pdfPath);

        if (!fullText || fullText.length < 20) {
          globalThis.ocrProgress[jobId] = 100;
          return;
        }

        // Step 2: Truncate text if too long
        globalThis.ocrProgress[jobId] = 40;
        const textToSummarize =
          fullText.length > MAX_INPUT_CHARS ? fullText.slice(0, MAX_INPUT_CHARS) : fullText;

        // Step 3: Summarize using Gemini
        globalThis.ocrProgress[jobId] = 60;
        const summaryText = await summarizeWithGemini(textToSummarize);

        // Step 4: Generate summary PDF
        globalThis.ocrProgress[jobId] = 80;
        const summaryPDFUrl = await generateSummaryPDF(summaryText, pdfName);

        // Step 5: Save to DB
        const newspaper = await prisma.newspaper.create({
          data: {
            title: pdfName,
            fileUrl: summaryPDFUrl,
            user: { connect: { id: userId } },
          },
        });

        await prisma.summary.create({
          data: {
            content: summaryText,
            newspaper: { connect: { id: newspaper.id } },
          },
        });

        // Step 6: Done
        globalThis.ocrProgress[jobId] = 100;
      } catch (innerErr: any) {
        console.error("[Upload] Processing error:", innerErr);
        globalThis.ocrProgress[jobId] = 100; // stop progress on error
      }
    });
  } catch (outerErr: any) {
    console.error("[Upload] Outer error:", outerErr);
    res.status(500).json({ error: outerErr.message || "Unexpected error" });
  }
}
