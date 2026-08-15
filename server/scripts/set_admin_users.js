const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Promote specified admin emails to ADMIN role
  const adminEmails = ['admin@velora.com', 'sushanthkonduri10@gmail.com', 'sushanthkonduri10@velora.com'];

  const updated = await prisma.user.updateMany({
    where: {
      email: {
        in: adminEmails,
      },
    },
    data: {
      role: 'ADMIN',
    },
  });

  console.log(`Updated ${updated.count} admin accounts.`);

  const users = await prisma.user.findMany();
  console.log('\nCurrent Users in DB:');
  for (const u of users) {
    console.log(`- Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
