import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pendingUsers = await prisma.user.findMany({ where: { approved: false, role: "USER" } });
  res.status(200).json(pendingUsers);
}

