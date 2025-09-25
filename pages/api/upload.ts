import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import { prisma } from "@/lib/prisma";
import { extractTextFromPDF, generateSummaryPDF } from "@/lib/pdf";
import { summarizeWithGemini } from "@/lib/ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Tell Next.js to let formidable handle multipart form data
export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // 1️⃣ User session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "User not logged in" });
    }
    const userId: string = session.user.id;
    console.log("[Upload] User ID:", userId);

    // 2️⃣ Parse incoming file
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files: any) => {
      if (err) {
        console.error("[Upload] Formidable error:", err);
        return res.status(500).json({ error: err.message });
      }

      const singleFile: File | undefined = Array.isArray(files.file)
        ? files.file[0]
        : files.file;

      if (!singleFile) {
        console.error("[Upload] No file received");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const pdfPath = (singleFile as any).filepath ?? (singleFile as any).path;
      const pdfName =
        (singleFile as any).originalFilename ?? "uploaded-file.pdf";
      console.log("[Upload] File received:", pdfName, "Path:", pdfPath);

      try {
        // 3️⃣ Extract text from PDF
        const text = await extractTextFromPDF(pdfPath);
        console.log("[Upload] Extracted text length:", text.length);

        // 4️⃣ Generate summary using Gemini (debug version logs inside)
        const summaryText = await summarizeWithGemini(text);
        console.log("[Upload] Gemini summary length:", summaryText.length);

        // 5️⃣ Generate summary PDF
        const summaryPDFUrl = await generateSummaryPDF(summaryText, pdfName);
        console.log("[Upload] Summary PDF created at:", summaryPDFUrl);

        // 6️⃣ Save Newspaper + Summary in DB
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

        // 7️⃣ Return success
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
