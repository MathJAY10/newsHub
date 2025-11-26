// scripts/worker.ts
import "dotenv/config"; // Load env vars for worker (REQUIRED)

import { Worker, Job } from "bullmq";
import { connection, WORKER_CONCURRENCY } from "../lib/queue"; // Redis + concurrency

console.log("🚀 Worker started...");

if (!process.env.REDIS_URL) {
  console.error("❌ REDIS_URL is missing in .env file!");
  process.exit(1);
}

// ==============================
// 🚀 MAIN WORKER
// ==============================
const worker = new Worker(
  "pdf-processing",
  async (job: Job) => {
    console.log(`📥 Received job: ${job.id}`);

    const { filePath, fileName, userId } = job.data as {
      filePath: string;
      fileName: string;
      userId: string;
    };

    // Lazy load heavy modules
    const { extractTextFromPDF, generateSummaryPDF } = await import("../lib/pdf");
    const { summarizeWithGemini } = await import("../lib/ai");
    const { prisma } = await import("../lib/prisma");

    const update = (p: number) => {
      console.log(`📊 Job ${job.id} progress: ${p}%`);
      return job.updateProgress(p);
    };

    try {
      update(5);

      // Extract text ----------------------------
      update(10);
      const fullText = await extractTextFromPDF(filePath);
      if (!fullText || fullText.length < 20) {
        throw new Error("PDF has no readable text");
      }

      // Chunk for large summaries ---------------
      const CHUNK_SIZE = 4000;
      const chunks: string[] = [];
      for (let i = 0; i < fullText.length; i += CHUNK_SIZE) {
        chunks.push(fullText.slice(i, i + CHUNK_SIZE));
      }

      update(20);

      // Summarize chunks ------------------------
      const partialSummaries: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        update(20 + Math.round((i / chunks.length) * 50));
        const part = await summarizeWithGemini(chunks[i]);
        partialSummaries.push(part);
      }

      // Merge summary ---------------------------
      const mergedSummary = partialSummaries.join("\n\n");

      update(80);

      // Generate summary PDF --------------------
      const summaryPDFUrl = await generateSummaryPDF(mergedSummary, fileName);

      update(90);

      // Save Newspaper --------------------------
      const newspaper = await prisma.newspaper.create({
        data: {
          title: fileName,
          fileUrl: summaryPDFUrl,
          userId,
        },
      });

      // Save Summary ----------------------------
      const summary = await prisma.summary.create({
        data: {
          content: mergedSummary,
          newspaperId: newspaper.id,
          userId,
        },
      });

      update(100);

      console.log(`✅ Job ${job.id} completed successfully`);
      return { newspaperId: newspaper.id, summaryId: summary.id };
    } catch (err) {
      console.error(`❌ Job ${job.id} failed:`, err);
      throw err;
    }
  },
  {
    connection,
    concurrency: WORKER_CONCURRENCY, // <-- IMPORTANT FIX
  }
);

// ==============================
// Worker event listeners
// ==============================
worker.on("completed", (job) => {
  console.log(`🎉 Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.log(`💀 Job failed: ${job?.id} -`, err);
});
