// scripts/create-root-user.ts
import { hash } from "bcryptjs";
import { prisma } from "C:/dev/cobam-group/lib/server/db/prisma";

async function main() {
  const email = "root@cobam.com";
  const password = "ChangeMeNow123!";

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      portal: "STAFF",
      powerType: "ROOT",
      status: "ACTIVE",
    },
    create: {
      email,
      passwordHash,
      portal: "STAFF",
      powerType: "ROOT",
      status: "ACTIVE",
    },
    select: {
      id: true,
      email: true,
      portal: true,
      powerType: true,
      status: true,
    },
  });

  console.log("Root user ready:", user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
