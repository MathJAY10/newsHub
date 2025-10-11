// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingMessage } from "http";
import formidable, { File } from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const config = { api: { bodyParser: false } };

// ✅ Ensure global progress object exists
if (!globalThis.ocrProgress) globalThis.ocrProgress = {};

declare global {
  var ocrProgress: { [key: string]: number };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req as unknown as IncomingMessage, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(500).json({ error: "File upload error" });
    }

    const uploaded = files["file"];
    const uploadedFile: File | undefined = Array.isArray(uploaded) ? uploaded[0] : uploaded;

    if (!uploadedFile) {
      console.error("No file uploaded — check FormData key name");
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ Generate jobId and simulate processing
    const jobId = uuidv4();
    globalThis.ocrProgress[jobId] = 0;

    console.log(`Received file: ${uploadedFile.originalFilename}`);
    console.log(`Job created: ${jobId}`);

    res.status(200).json({
      message: "File uploaded successfully",
      jobId,
    });

    // (Optional) Simulate progress updates
    setTimeout(() => (globalThis.ocrProgress[jobId] = 25), 1000);
    setTimeout(() => (globalThis.ocrProgress[jobId] = 75), 2000);
    setTimeout(() => (globalThis.ocrProgress[jobId] = 100), 3000);
  });
}
