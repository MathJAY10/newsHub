import fs from "fs";
import pdfParse from "pdf-parse";
import PDFDocument from "pdfkit";
export async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}




export async function generateSummaryPDF(summaryText: string, fileName: string) {
  const filePath = `public/summaries/${fileName}-summary.pdf`;

  // Make sure directory exists
  fs.mkdirSync("public/summaries", { recursive: true });

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(12).text(summaryText, { lineGap: 4 });

  doc.end();

  return `/summaries/${fileName}-summary.pdf`;
}
