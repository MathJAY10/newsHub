// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import { processUpload } from "@/controllers/uploadController";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const form = formidable({ multiples: false });

  form.parse(req as any, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File upload error" });

    const raw = files["file"];
    const file: File | undefined = raw ? (Array.isArray(raw) ? raw[0] : (raw as File)) : undefined;
    if (!file) return res.status(400).json({ error: "File missing" });

    if (!file) return res.status(400).json({ error: "File missing" });

    try {
      // Step 1: Process PDF
      const { text, summaryPDFUrl, pdfName } = await processUpload(file);

      // Step 2: Save Newspaper record
      const newspaper = await prisma.newspaper.create({
        data: {
          title: pdfName,
          fileUrl: file.newFilename ?? "uploaded.pdf",
          userId,
        },
      });

      // Step 3: Save Summary record
      const summary = await prisma.summary.create({
        data: {
          content: text,
          newspaperId: newspaper.id,
          userId,
        },
        include: { newspaper: true },
      });

      return res.status(200).json(summary);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Processing failed" });
    }
  });
}
