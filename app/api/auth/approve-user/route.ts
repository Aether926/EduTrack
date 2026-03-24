import { PrismaClient } from "@/app/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { id } = await req.json() as { id: string };
    await prisma.user.update({ where: { id }, data: { status: "approved" } });
    return NextResponse.json({ message: "Approved" }, { status: 200 });
}