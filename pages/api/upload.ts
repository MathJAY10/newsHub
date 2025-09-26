import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import { prisma } from "@/lib/prisma";
import { extractTextFromPDF, generateSummaryPDF } from "@/lib/pdf";
import { summarizeWithGemini } from "@/lib/ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const config = { api: { bodyParser: false } };

const MAX_INPUT_CHARS = 3000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // 1️⃣ Check user session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ error: "User not logged in" });
    const userId = session.user.id;
    console.log("[Upload] User ID:", userId);

    // 2️⃣ Parse uploaded file
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files: any) => {
      if (err) return res.status(500).json({ error: err.message });

      const singleFile: File | undefined = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!singleFile) return res.status(400).json({ error: "No file uploaded" });

      const pdfPath = (singleFile as any).filepath ?? (singleFile as any).path;
      const pdfName = (singleFile as any).originalFilename ?? "uploaded-file.pdf";
      console.log("[Upload] File received:", pdfName, "Path:", pdfPath);

      try {
        // 3️⃣ Extract text (with OCR fallback)
        const fullText = await extractTextFromPDF(pdfPath);
        if (!fullText || fullText.length < 20)
          return res.status(400).json({ error: "PDF contains too little text to summarize" });

        // 4️⃣ Truncate for Gemini
        const textToSummarize =
          fullText.length > MAX_INPUT_CHARS ? fullText.slice(0, MAX_INPUT_CHARS) : fullText;

        // 5️⃣ Generate structured summary
        const summaryText = await summarizeWithGemini(textToSummarize);
        console.log("[Upload] Gemini summary length:", summaryText.length);

        // 6️⃣ Generate summary PDF
        const summaryPDFUrl = await generateSummaryPDF(summaryText, pdfName);
        console.log("[Upload] Summary PDF created at:", summaryPDFUrl);

        // 7️⃣ Save Newspaper + Summary in DB
        const newspaper = await prisma.newspaper.create({
          data: {
            title: pdfName,
            fileUrl: summaryPDFUrl,
            user: { connect: { id: userId } },
          },
        });

        const summary = await prisma.summary.create({
          data: {
            content: summaryText,
            newspaper: { connect: { id: newspaper.id } },
          },
        });

        console.log("[Upload] DB save successful. Summary ID:", summary.id);
        res.status(200).json({ newspaper, summary });
      } catch (innerErr: any) {
        console.error("[Upload] Processing error:", innerErr);
        res.status(500).json({ error: innerErr.message || "Processing failed" });
      }
    });
  } catch (outerErr: any) {
    console.error("[Upload] Outer error:", outerErr);
    res.status(500).json({ error: outerErr.message || "Unexpected error" });
  }
}
