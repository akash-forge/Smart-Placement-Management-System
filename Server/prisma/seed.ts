// One-time script to create the first (and only) Admin account directly in
// the database — this is the replacement for letting people self-select
// "Admin" on the public sign-up page, which was a real privilege-escalation
// hole (anyone could grant themselves full admin access with zero checks).
//
// Run with:  npx ts-node prisma/seed.ts
// (or add "prisma": { "seed": "ts-node prisma/seed.ts" } to package.json
// and run `npx prisma db seed` instead)
//
// Change the email/password below before running, then change the password
// again after your first login — this file will likely sit in source
// control, so don't leave real credentials in it long-term.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@placementcell.local';
const ADMIN_PASSWORD = 'ChangeMe123!';
const ADMIN_NAME = 'Super Admin';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log(`An account with ${ADMIN_EMAIL} already exists (id=${existing.id}, role=${existing.role}). Nothing to do.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phoneno: '0000000000',
      password: hashedPassword,
      role: 'ADMIN',
      avatarUrl:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23171717'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%239ee600'/%3E%3Cpath d='M6 36c0-8 6-13 14-13s14 5 14 13' fill='%239ee600'/%3E%3C/svg%3E",
    },
  });

  console.log('Admin account created:');
  console.log(`  email:    ${ADMIN_EMAIL}`);
  console.log(`  password: ${ADMIN_PASSWORD}`);
  console.log(`  id:       ${admin.id}`);
  console.log('Log in, then change this password from the app.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
