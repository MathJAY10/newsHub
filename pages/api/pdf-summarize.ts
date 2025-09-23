import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import pdf from "pdf-parse";
import PDFDocument from "pdfkit";

// Tell Next.js not to parse the body – Formidable will handle it
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "File upload error" });
    }

    // ✅ Correct, type-safe way to grab the uploaded file
    const uploaded = files["file"];
    const uploadedFile: File | undefined = Array.isArray(uploaded) ? uploaded[0] : uploaded;

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Read and extract text from the uploaded PDF
      const dataBuffer = fs.readFileSync(uploadedFile.filepath);
      const pdfData = await pdf(dataBuffer);
      const text = pdfData.text || "No text found in PDF";

      // Create a new PDF containing the extracted text
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
      doc.fontSize(12).text(text.substring(0, 2000)); // limit for demo
      doc.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error processing PDF" });
    }
  });
}
