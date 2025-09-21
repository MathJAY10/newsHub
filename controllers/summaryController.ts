import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // make sure prisma client exists

export async function summaryController(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { search, id } = req.query;

    const where: any = {};

    if (id) where.id = Number(id);
    if (search) where.content = { contains: search.toString(), mode: "insensitive" };

    const summaries = await prisma.summary.findMany({
      where,
      include: { newspaper: { select: { title: true, fileUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 20, // limit latest 20 summaries
    });

    res.status(200).json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch summaries" });
  }
}
