// pages/api/summaries/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const summaries = await prisma.summary.findMany({
        include: { newspaper: true },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(summaries);
    } catch (err) {
      console.error("Failed to fetch summaries:", err);
      return res.status(500).json({ error: "Failed to fetch summaries" });
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body;
      const summary = await prisma.summary.create({ data: body });
      return res.status(201).json(summary);
    } catch (err) {
      console.error("Failed to create summary:", err);
      return res.status(500).json({ error: "Failed to create summary" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
