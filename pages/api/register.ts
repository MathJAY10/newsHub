// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, sessionClaims } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Clerk user data
    const email = typeof sessionClaims?.email === "string" ? sessionClaims.email : null;
    const name = typeof sessionClaims?.fullName === "string" ? sessionClaims.fullName : null;
    const image = typeof sessionClaims?.imageUrl === "string" ? String(sessionClaims.imageUrl) : null;

    // Create or update profile in Prisma
    await prisma.userProfile.upsert({
      where: { id: userId },
      update: { email, name, image },
      create: {
        id: userId,
        email,
        name,
        image,
      },
    });

    return res.status(200).json({ status: "ok" });

  } catch (err: any) {
    console.error("Error syncing user:", err);
    return res.status(500).json({ error: "Could not create user profile" });
  }
}
