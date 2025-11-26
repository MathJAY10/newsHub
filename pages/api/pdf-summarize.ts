//page/api/pdf-summaries
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import pdf from "pdf-parse";
import { prisma } from "@/lib/prisma";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = formidable({ multiples: false });

  form.parse(req as any, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File upload error" });

    let uploaded: File | undefined;
    const raw = files["file"];

    if (Array.isArray(raw)) uploaded = raw[0]; // if multiple
    else if (raw) uploaded = raw as File; // if single

    if (!uploaded) return res.status(400).json({ error: "No file uploaded" });

    try {
      const dataBuffer = fs.readFileSync(uploaded.filepath);
      const pdfData = await pdf(dataBuffer);
      const text = pdfData.text || "No text found in PDF";

      const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
      if (!userId) return res.status(400).json({ error: "User ID is required" });

      // Create Newspaper
      const newspaper = await prisma.newspaper.create({
        data: {
          title: uploaded.originalFilename || "Uploaded PDF",
          fileUrl: `/uploads/${uploaded.newFilename}`, // adjust path
          userId,
        },
      });

      // Create Summary
      const summary = await prisma.summary.create({
        data: {
          content: text.substring(0, 2000),
          newspaperId: newspaper.id,
          userId,
        },
      });

      return res.status(200).json({ message: "PDF processed", summary });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error processing PDF" });
    }
  });
}
