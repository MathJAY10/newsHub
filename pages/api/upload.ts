import type { NextApiRequest, NextApiResponse } from "next";
import type { IncomingMessage } from "http";
import formidable, { File } from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = formidable({ multiples: false });

  // ✅ Cast to Node.js IncomingMessage properly
  form.parse(req as unknown as IncomingMessage, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File upload error" });

    const uploaded = files["file"];
    const uploadedFile: File | undefined = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    if (!uploadedFile) return res.status(400).json({ error: "No file uploaded" });

    const dataBuffer = fs.readFileSync(uploadedFile.filepath);
    // process PDF...
    res.status(200).json({ message: "File uploaded successfully" });
  });
}
