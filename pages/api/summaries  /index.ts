import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    switch (req.method) {
      case "GET": {
        const search = req.query.search?.toString() || "";

        const summaries = await prisma.summary.findMany({
          where: {
            userId,
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
          include: { newspaper: true },
          orderBy: { createdAt: "desc" },
        });

        return res.status(200).json(summaries);
      }

      default:
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error("❌ summaries/index.ts Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
