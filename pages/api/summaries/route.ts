import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  try {
    const summaries = await prisma.summary.findMany({
      where: search
        ? {
            OR: [
              { content: { contains: search, mode: "insensitive" } },
              { newspaper: { title: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {},
      include: { newspaper: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(summaries);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch summaries" }, { status: 500 });
  }
}
