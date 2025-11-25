// pages/api/summaries/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    if (req.method === "GET") {
      const search = req.query.search?.toString() || "";

      const summaries = await prisma.summary.findMany({
        where: {
          userId, // 🟢 THIS FIXES THE ISSUE
          ...(search
            ? {
                OR: [
                  { content: { contains: search, mode: "insensitive" } },
                  {
                    newspaper: {
                      title: { contains: search, mode: "insensitive" },
                    },
                  },
                ],
              }
            : {}),
        },
        include: {
          newspaper: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(summaries);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });

  } catch (error: any) {
    console.error("❌ /api/summaries error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
