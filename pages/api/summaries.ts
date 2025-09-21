import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const { search } = req.query;

    const where: any = {};
    if (search) where.content = { contains: search.toString(), mode: "insensitive" };

    const summaries = await prisma.summary.findMany({
      where,
      include: { newspaper: { select: { title: true, fileUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.status(200).json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch summaries" });
  }
}
