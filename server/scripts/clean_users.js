const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    let cleanName = u.name;
    if (!cleanName || cleanName.toLowerCase().startsWith('testuser_') || cleanName === 'Test User' || cleanName === 'Unnamed User') {
      const prefix = u.email.split('@')[0].replace(/[0-9_.]+/g, ' ').trim();
      cleanName = prefix
        ? prefix.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        : 'Customer Account';
      
      await prisma.user.update({
        where: { id: u.id },
        data: { name: cleanName },
      });
      console.log(`Updated user ${u.id} (${u.email}) name -> ${cleanName}`);
    }
  }
  console.log('✅ User names cleanup complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
