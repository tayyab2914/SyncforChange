import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@syncforchange.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin123456";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      emailVerified: true,
    },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      emailVerified: true,
    },
  });

  console.log(`Admin user ready: ${admin.email}`);
  console.log(`Login at /admin/login with password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
