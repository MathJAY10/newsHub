import fs from "fs";
import pdfParse from "pdf-parse";

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// Example stub for generating a summary PDF
export async function generateSummaryPDF(summaryText: string, fileName: string) {
  const filePath = `public/summaries/${fileName}-summary.pdf`;
  fs.writeFileSync(filePath, summaryText);
  return `/summaries/${fileName}-summary.pdf`;
}
