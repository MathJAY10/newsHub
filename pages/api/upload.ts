import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import { prisma } from "@/lib/prisma";
import { extractTextFromPDF, generateSummaryPDF } from "@/lib/pdf";
import { summarizeWithGemini } from "@/lib/ai";

export const config = { api: { bodyParser: false } };

type ReqWithFile = NextApiRequest & { file: File };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const singleFile = Array.isArray(files.file)
      ? files.file[0]
      : (files.file as File | undefined);

    if (!singleFile) return res.status(400).json({ error: "No file uploaded" });

    const f = singleFile;
    const pdfPath = (f as any).filepath ?? (f as any).path;
    const pdfName = (f as any).originalFilename ?? "file.pdf";

    try {
      // 1️⃣ Extract text
      const text = await extractTextFromPDF(pdfPath);

      // 2️⃣ Generate summary
      const summaryText = await summarizeWithGemini(text);

      // 3️⃣ Generate summary PDF
      const summaryPDFUrl = await generateSummaryPDF(summaryText, pdfName);

      // 4️⃣ Save Newspaper + Summary in DB
      // Replace 1 with logged-in user id from session
      const newspaper = await prisma.newspaper.create({
        data: {
          title: pdfName,
          fileUrl: summaryPDFUrl,
          user: { connect: { id: 1 } },
        },
      });

      const summary = await prisma.summary.create({
        data: {
          content: summaryText,
          newspaper: { connect: { id: newspaper.id } },
        },
      });

      res.status(200).json({ summary, newspaper });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
}
