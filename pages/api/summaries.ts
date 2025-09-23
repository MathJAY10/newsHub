// pages/api/summaries.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const { id, search } = req.query;

    // If id is provided, fetch a single summary
    if (id) {
      const summary = await prisma.summary.findUnique({
        where: { id: Number(id) }, // ✅ Convert string to number
        include: { newspaper: { select: { title: true, fileUrl: true } } },
      });

      if (!summary) return res.status(404).json({ error: "Summary not found" });

      return res.status(200).json(summary); // single object
    }

    // Otherwise, fetch latest summaries, optionally filtered by search
    const where: any = {};
    if (search) where.content = { contains: search.toString(), mode: "insensitive" };

    const summaries = await prisma.summary.findMany({
      where,
      include: { newspaper: { select: { title: true, fileUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.status(200).json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch summaries" });
  }
}
