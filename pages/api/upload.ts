// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import { prisma } from "@/lib/prisma";
import { extractTextFromPDF, generateSummaryPDF } from "@/lib/pdf";
import { summarizeWithGemini } from "@/lib/ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // 1️⃣ Get user session
  const session = await getServerSession(req, res, authOptions);

  // 2️⃣ Ensure user is logged in
  if (!session?.user?.id) {
    return res.status(401).json({ error: "User not logged in" });
  }

  // 3️⃣ Narrow type for TypeScript
  const userId: string = session.user.id;

  // 4️⃣ Parse incoming file
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files: any) => {
    if (err) return res.status(500).json({ error: err.message });

    const singleFile: File | undefined = Array.isArray(files.file)
      ? files.file[0]
      : files.file;

    if (!singleFile) return res.status(400).json({ error: "No file uploaded" });

    // 5️⃣ Extract path and filename
    const pdfPath = (singleFile as any).filepath ?? (singleFile as any).path;
    const pdfName = (singleFile as any).originalFilename ?? "file.pdf";

    try {
      // 6️⃣ Extract text from PDF
      const text = await extractTextFromPDF(pdfPath);

      // 7️⃣ Generate summary using Gemini
      const summaryText = await summarizeWithGemini(text);

      // 8️⃣ Generate summary PDF
      const summaryPDFUrl = await generateSummaryPDF(summaryText, pdfName);

      // 9️⃣ Save Newspaper + Summary in DB
      const newspaper = await prisma.newspaper.create({
        data: {
          title: pdfName,
          fileUrl: summaryPDFUrl,
          user: { connect: { id: userId } }, // ✅ TS happy
        },
      });

      const summary = await prisma.summary.create({
        data: {
          content: summaryText,
          newspaper: { connect: { id: newspaper.id } },
        },
      });

      // 🔟 Return success
      res.status(200).json({ newspaper, summary });
    } catch (error: any) {
      console.error("Upload API error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
}
