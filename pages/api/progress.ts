// pages/api/progress.ts
import type { NextApiRequest, NextApiResponse } from "next";

// ✅ Ensure ocrProgress is initialized on first use
if (!globalThis.ocrProgress) {
  globalThis.ocrProgress = {};
}

// --- Extend globalThis for TypeScript ---
declare global {
  var ocrProgress: { [key: string]: number };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { jobId } = req.query;

  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ error: "Missing or invalid jobId" });
  }

  // ✅ Safe access with fallback
  const progress = globalThis.ocrProgress[jobId] ?? 0;

  res.status(200).json({ progress });
}
