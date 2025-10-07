import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL!);

export const pdfQueue = new Queue("pdf-processing", { connection });

// Worker to process PDFs asynchronously
export const pdfWorker = new Worker(
  "pdf-processing",
  async (job) => {
    const { filePath, fileName, userId } = job.data;
    const { extractTextFromPDF, generateSummaryPDF } = await import("./pdf");
    const { summarizeWithGemini } = await import("./ai");
    const { prisma } = await import("./prisma");

    // 1️⃣ Extract text
    const fullText = await extractTextFromPDF(filePath);
    if (!fullText || fullText.length < 20) {
      throw new Error("PDF text too short to summarize.");
    }

    // 2️⃣ Chunk text
    const chunks = chunkText(fullText, 2500);

    // 3️⃣ Summarize each chunk
    const summaries = await Promise.all(chunks.map((chunk) => summarizeWithGemini(chunk)));

    // 4️⃣ Merge summaries
    const mergedSummary = summaries.join("\n\n");

    // 5️⃣ Generate PDF
    const summaryPDFUrl = await generateSummaryPDF(mergedSummary, fileName);

    // 6️⃣ Save Newspaper with user
    const newspaper = await prisma.newspaper.create({
      data: {
        title: fileName,
        fileUrl: summaryPDFUrl,
        user: { connect: { id: userId } }, // ✅ Connect user
      },
    });

    // 7️⃣ Save Summary with user
    await prisma.summary.create({
      data: {
        content: mergedSummary,
        newspaper: { connect: { id: newspaper.id } },
        user: { connect: { id: userId } }, // ✅ Connect user
      },
    });

    return { newspaperId: newspaper.id };
  },
  { connection }
);

// Helper: split text into chunks
function chunkText(text: string, size: number) {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size;
  }
  return chunks;
}
