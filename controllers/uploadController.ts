// lib/controllers/uploadController.ts
import type { File as FormidableFile } from "formidable";
import { extractTextFromPDF, generateSummaryPDF } from "@/lib/pdf";
import { summarizeWithGemini } from "@/lib/ai";

export async function processUpload(file: FormidableFile) {
  const pdfPath = (file as any).filepath ?? file.filepath;
  const pdfName =
    (file as any).originalFilename ?? file.originalFilename ?? "file.pdf";

  const text = await extractTextFromPDF(pdfPath);
  const summaryText = await summarizeWithGemini(text);
  const summaryPDFUrl = await generateSummaryPDF(summaryText, pdfName);

  return { text: summaryText, summaryPDFUrl, pdfName };
}
