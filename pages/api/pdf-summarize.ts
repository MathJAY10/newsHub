import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingMessage } from "http";
import formidable, { File } from "formidable";
import fs from "fs";
import pdf from "pdf-parse";
import PDFDocument from "pdfkit";

export const config = {
  api: {
    bodyParser: false, // Formidable handles parsing
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  // ✅ Cast req properly for Formidable
  form.parse(req as unknown as IncomingMessage, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File upload error" });

    const uploaded = files["file"];
    const uploadedFile: File | undefined = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    if (!uploadedFile) return res.status(400).json({ error: "No file uploaded" });

    try {
      const dataBuffer = fs.readFileSync(uploadedFile.filepath);
      const pdfData = await pdf(dataBuffer);
      const text = pdfData.text || "No text found in PDF";

      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=summary.pdf");
        res.send(pdfBuffer);
      });

      doc.fontSize(14).text("=== PDF Summary ===\n\n", { underline: true });
      doc.fontSize(12).text(text.substring(0, 2000));
      doc.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error processing PDF" });
    }
  });
}
