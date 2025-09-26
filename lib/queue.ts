// lib/queue.ts
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL!);

export const pdfQueue = new Queue("pdf-processing", { connection });

// Optional: Worker (can also be in separate file/service)
export const pdfWorker = new Worker(
  "pdf-processing",
  async job => {
    const { filePath, fileName, userId } = job.data;
    const { extractTextFromPDF } = await import("./pdf");
    const { summarizeWithGemini } = await import("./ai");
    const { generateSummaryPDF } = await import("./pdf");
    const { prisma } = await import("./prisma");

    // 1️⃣ Extract text (PDF layer + OCR fallback)
    const fullText = await extractTextFromPDF(filePath);

    // 2️⃣ Chunk text for Gemini
    const chunks = chunkText(fullText, 2500); // 2500 chars per chunk

    // 3️⃣ Summarize each chunk in parallel
    const summaries = await Promise.all(chunks.map(chunk => summarizeWithGemini(chunk)));

    // 4️⃣ Merge summaries
    const mergedSummary = summaries.join("\n\n");

    // 5️⃣ Generate PDF
    const summaryPDFUrl = await generateSummaryPDF(mergedSummary, fileName);

    // 6️⃣ Save to DB
    const newspaper = await prisma.newspaper.create({
      data: {
        title: fileName,
        fileUrl: summaryPDFUrl,
        user: { connect: { id: userId } },
      },
    });

    await prisma.summary.create({
      data: {
        content: mergedSummary,
        newspaper: { connect: { id: newspaper.id } },
      },
    });

    return { newspaperId: newspaper.id };
  },
  { connection }
);

// Helper: simple chunking by chars
function chunkText(text: string, size: number) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size;
  }
  return chunks;
}
