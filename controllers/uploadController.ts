import type { NextApiRequest, NextApiResponse } from "next";
import type { File as FormidableFile } from "formidable";
import { extractTextFromPDF, generateSummaryPDF } from "@/lib/pdf";
import { summarizeWithGemini } from "@/lib/ai";

export async function uploadController(
  req: NextApiRequest & { file?: FormidableFile | FormidableFile[] },
  res: NextApiResponse
) {
  try {
    const { file } = req;

    if (!file || Array.isArray(file)) {
      return res.status(400).json({ error: "No single file uploaded" });
    }

    // TypeScript-safe file access
    const f = file as FormidableFile;
    const pdfPath = (f as any).filepath ?? (f as any).path;
    const pdfName = (f as any).originalFilename ?? (f as any).name ?? "file.pdf";

    const text = await extractTextFromPDF(pdfPath);
    const summaryText = await summarizeWithGemini(text);
    const summaryPDFUrl = await generateSummaryPDF(summaryText, pdfName);

    res.status(200).json({ summaryText, summaryPDFUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
