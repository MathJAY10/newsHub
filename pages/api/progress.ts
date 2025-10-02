import type { NextApiRequest, NextApiResponse } from "next";

// --- Extend globalThis for TypeScript ---
declare global {
  var ocrProgress: { [key: string]: number };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { jobId } = req.query;

  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ error: "Missing or invalid jobId" });
  }

  const progress = globalThis.ocrProgress[jobId] ?? 0;
  res.status(200).json({ progress });
}
