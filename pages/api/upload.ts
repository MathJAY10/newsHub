// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import { getAuth } from "@clerk/nextjs/server";
import { pdfQueue } from "@/lib/queue";

export const config = {
  api: {
    bodyParser: false, // ❗ required for formidable
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Clerk Auth
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Configure formidable with higher limits
  const form = formidable({
    multiples: false,
    maxFileSize: 200 * 1024 * 1024, // ✅ 200MB upload limit
    maxFieldsSize: 10 * 1024 * 1024, // optional
  });

  form.parse(req as any, async (err, fields, files) => {
    if (err) {
      console.error("❌ Formidable parse error:", err);
      return res.status(400).json({ error: "Invalid upload" });
    }

    // Get uploaded file
    const raw = files["file"];
    const uploaded: File | undefined =
      raw ? (Array.isArray(raw) ? raw[0] : (raw as File)) : undefined;

    if (!uploaded) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // File path in tmp directory
    const filePath = uploaded.filepath ?? (uploaded as any).path;
    const fileName =
      uploaded.originalFilename ??
      (uploaded as any).newFilename ??
      "uploaded.pdf";

    try {
      // Add job to queue for worker to process PDF
      const job = await pdfQueue.add(
        "process-pdf",
        { filePath, fileName, userId },
        {
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      console.log("📤 Job added:", job.id);

      // Respond with jobId so frontend can poll progress
      return res.status(200).json({ jobId: job.id });
    } catch (error) {
      console.error("❌ Queue enqueue error:", error);
      return res.status(500).json({ error: "Failed to enqueue job" });
    }
  });
}
