// pages/api/summaries/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await currentUser();
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const id = Number(req.query.id);

  if (req.method === "DELETE") {
    const summary = await prisma.summary.findUnique({
      where: { id },
    });

    if (!summary) return res.status(404).json({ error: "Not found" });

    if (summary.userId !== user.id)
      return res.status(403).json({ error: "Unauthorized" });

    await prisma.summary.delete({ where: { id } });

    return res.status(200).json({ message: "Deleted" });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
