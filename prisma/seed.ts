import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("yourAdminPassword", 10);

  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: passwordHash,
      role: "admin",
    },
  });

  toast.log("Admin created!");
}

main()
  .catch((e) => toast.error(e))
  .finally(async () => await prisma.$disconnect());
