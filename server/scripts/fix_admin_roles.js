const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Current users in DB:');
  for (const u of users) {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
  }

  // Demote any user who is not admin@velora.com to CUSTOMER
  const updatedCount = await prisma.user.updateMany({
    where: {
      email: {
        not: 'admin@velora.com',
      },
      role: 'ADMIN',
    },
    data: {
      role: 'CUSTOMER',
    },
  });

  console.log(`\nUpdated ${updatedCount.count} users to CUSTOMER role (only admin@velora.com remains ADMIN).`);

  const updatedUsers = await prisma.user.findMany();
  console.log('\nFinal users list:');
  for (const u of updatedUsers) {
    console.log(`- Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
