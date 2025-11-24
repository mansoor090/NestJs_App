import { PrismaClient, UserRole, ProductType } from '@prisma/client';
import { hashPassword } from 'src/Utils/hash.util';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for admin user
  const adminPassword = await hashPassword('Admin123$');

  // Create admin user (only if it doesn't exist)
  const adminEmail = 'admin@gmail.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: UserRole.ADMIN,
      },
    });
    console.log('✅ Admin user created:', admin.email);
  } else {
    console.log('ℹ️  Admin user already exists:', adminEmail);
  }

  // Initialize default settings using ProductType enum directly
  const settings = [
    { key: ProductType.MONTHLY_BILL, value: '1000' },
    { key: ProductType.LATE_SURCHARGE, value: '100' },
  ];

  for (const setting of settings) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const existing = await prisma.settings.findUnique({
      where: { key: setting.key },
    });

    if (!existing) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await prisma.settings.create({
        data: setting,
      });
      console.log(`✅ Setting created: ${setting.key} = ${setting.value}`);
    } else {
      console.log(`ℹ️  Setting already exists: ${setting.key}`);
    }
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
