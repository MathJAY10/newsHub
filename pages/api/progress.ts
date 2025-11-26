// pages/api/progress.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pdfQueue } from "@/lib/queue";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { jobId } = req.query;

  // If jobId is missing or obviously wrong, just say "idle"
  if (!jobId || jobId === "null" || jobId === "undefined") {
    return res.status(200).json({
      state: "idle",
      progress: 0,
    });
  }

  try {
    const job = await pdfQueue.getJob(jobId as string);

    // If job does not exist anymore, treat it as "completed"
    if (!job) {
      return res.status(200).json({
        state: "completed",
        progress: 100,
      });
    }

    const state = await job.getState();
    const progress = job.progress ?? 0;

    return res.status(200).json({ state, progress });
  } catch (error) {
    console.error("❌ Progress API error:", error);
    // Don't crash the frontend – return a safe fallback
    return res.status(200).json({ state: "unknown", progress: 0 });
  }
}
