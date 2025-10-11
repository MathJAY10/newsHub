import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      // ==============================
      // 🟢 GET — Fetch all summaries
      // ==============================
      case "GET": {
        const search = req.query.search?.toString() || "";

        const summaries = await prisma.summary.findMany({
          where: search
            ? {
                OR: [
                  { content: { contains: search, mode: "insensitive" } },
                  { newspaper: { title: { contains: search, mode: "insensitive" } } },
                ],
              }
            : {},
          include: {
            newspaper: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        console.log(`✅ Found ${summaries.length} summaries`);
        return res.status(200).json(summaries);
      }

      // ==============================
      // 🟡 POST — Create a new summary
      // ==============================
      case "POST": {
        const { content, userId, newspaperId } = req.body;

        console.log("📩 Incoming POST /api/summaries:", req.body);

        // Validation
        if (!content || !userId || !newspaperId) {
          return res.status(400).json({
            error: "Missing required fields: content, userId, newspaperId",
          });
        }

        const summary = await prisma.summary.create({
          data: {
            content,
            userId,
            newspaperId: Number(newspaperId),
          },
          include: {
            newspaper: true,
            user: { select: { name: true, email: true } },
          },
        });

        console.log("✅ Summary created:", summary.id);
        return res.status(201).json(summary);
      }

      // ==============================
      // 🔴 Unsupported Methods
      // ==============================
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error("❌ /api/summaries Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
