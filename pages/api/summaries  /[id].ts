// pages/api/summaries/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const  id  = req.query; 
  console.log(id)
    console.log("Inside the delete controler ")
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  if (req.method === "DELETE") {
    try {
      const deleted = await prisma.summary.delete({
        where: { id: Number(id) },
      });
      return res.status(200).json({ success: true, deleted });
    } catch (err) {
      console.error("Failed to delete summary:", err);
      return res.status(500).json({ error: "Failed to delete summary" });
    }
  }

  // Return 405 for other methods
  res.setHeader("Allow", ["DELETE"]);
  res.status(405).json({ error: `Method ${req.method} not allowed` });
}
