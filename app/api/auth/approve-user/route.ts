import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body as { id: string };
  await prisma.user.update({ where: { id }, data: { approved: true } });
  res.status(200).json({ message: "Approved" });
}
