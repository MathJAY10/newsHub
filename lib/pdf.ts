import fs from "fs";
import pdfParse from "pdf-parse";
import { fromPath } from "pdf2pic";
import Tesseract from "tesseract.js";
import PDFDocument from "pdfkit";

type PDF2PicPage = {
  name: string;
  size: number;
  path: string;
};

/**
 * Convert a single PDF page to image (typed wrapper)
 */
async function convertPageToImage(filePath: string, tempDir: string, pageNumber: number): Promise<PDF2PicPage> {
  const storeAsImage: any = fromPath(filePath, { density: 150, savePath: tempDir });
  const rawPage = await storeAsImage(pageNumber, { format: "png" });

  // Type assertion: map only required properties
  const page: PDF2PicPage = {
    path: rawPage.path,
    name: rawPage.name,
    size: rawPage.size,
  };
  return page;
}

/**
 * Extract text from PDF
 * - Normal PDFs: pdf-parse
 * - Scanned PDFs: pdf2pic + Tesseract OCR
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);

  // 1️⃣ Normal text extraction
  const data = await pdfParse(buffer);
  let text = data.text.trim();

  // 2️⃣ OCR fallback if text is too short
  if (!text || text.length < 20) {
    console.log("[PDF] No text found, running OCR...");

    const tempDir = "./temp_images";
    fs.mkdirSync(tempDir, { recursive: true });

    const pageCount = data.numpages || 10;
    text = "";

    for (let i = 1; i <= pageCount; i++) {
      const page = await convertPageToImage(filePath, tempDir, i);

      const { data: { text: ocrText } } = await Tesseract.recognize(page.path, "eng", {
        logger: (m) => console.log("[OCR]", (m.progress * 100).toFixed(2) + "%", m.status),
      });

      text += ocrText + "\n";
    }

    // Cleanup temp images
    fs.rmSync(tempDir, { recursive: true, force: true });
    text = text.trim();
  }

  console.log("[PDF] Extracted text length:", text.length);
  return text;
}

/**
 * Generate PDF from summary text
 */
export async function generateSummaryPDF(summaryText: string, fileName: string): Promise<string> {
  const filePath = `public/summaries/${fileName}-summary.pdf`;

  fs.mkdirSync("public/summaries", { recursive: true });

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(12).text(summaryText, { lineGap: 4 });
  doc.end();

  return `/summaries/${fileName}-summary.pdf`;
}
