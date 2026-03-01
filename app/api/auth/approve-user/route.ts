import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { id } = await req.json() as { id: string };
    await prisma.user.update({ where: { id }, data: { approved: true } });
    return NextResponse.json({ message: "Approved" }, { status: 200 });
}