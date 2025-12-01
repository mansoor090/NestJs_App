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

  // Create test resident user
  const testResidentEmail = 'testresident@gmail.com';
  const testResidentPassword = await hashPassword('Test123$');
  let testResident = await prisma.user.findUnique({
    where: { email: testResidentEmail },
  });

  if (!testResident) {
    testResident = await prisma.user.create({
      data: {
        name: 'Test Resident',
        email: testResidentEmail,
        password: testResidentPassword,
        role: UserRole.RESIDENT,
      },
    });
    console.log('✅ Test resident user created:', testResident.email);
  } else {
    console.log('ℹ️  Test resident user already exists:', testResidentEmail);
  }

  // Create a house for the test resident (if it doesn't exist)
  let testHouse = await prisma.house.findFirst({
    where: {
      userId: testResident.id,
      houseNo: 'TEST-001',
    },
  });

  if (!testHouse) {
    testHouse = await prisma.house.create({
      data: {
        houseNo: 'TEST-001',
        userId: testResident.id,
      },
    });
    console.log('✅ Test house created:', testHouse.houseNo);
  } else {
    console.log('ℹ️  Test house already exists:', testHouse.houseNo);
  }

  // Get monthly bill amount from settings
  const monthlyBillSetting = await prisma.settings.findUnique({
    where: { key: ProductType.MONTHLY_BILL },
  });
  const monthlyBillAmount = monthlyBillSetting
    ? parseFloat(monthlyBillSetting.value)
    : 1000; // Default to 1000 if setting not found

  // Create invoices for the last 2 months
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  // Check and create invoice for last month
  const lastMonthInvoice = await prisma.invoice.findFirst({
    where: {
      houseId: testHouse.id,
      createdAt: {
        gte: lastMonth,
        lt: currentMonth,
      },
    },
  });

  if (!lastMonthInvoice) {
    await prisma.invoice.create({
      data: {
        userId: testResident.id,
        houseId: testHouse.id,
        createdAt: lastMonth,
        items: {
          create: {
            productType: ProductType.MONTHLY_BILL,
            amount: monthlyBillAmount,
            createdAt: lastMonth,
          },
        },
      },
    });
    console.log('✅ Invoice created for last month');
  } else {
    console.log('ℹ️  Invoice for last month already exists');
  }

  // Check and create invoice for 2 months ago
  const twoMonthsAgoInvoice = await prisma.invoice.findFirst({
    where: {
      houseId: testHouse.id,
      createdAt: {
        gte: twoMonthsAgo,
        lt: lastMonth,
      },
    },
  });

  if (!twoMonthsAgoInvoice) {
    await prisma.invoice.create({
      data: {
        userId: testResident.id,
        houseId: testHouse.id,
        createdAt: twoMonthsAgo,
        items: {
          create: {
            productType: ProductType.MONTHLY_BILL,
            amount: monthlyBillAmount,
            createdAt: twoMonthsAgo,
          },
        },
      },
    });
    console.log('✅ Invoice created for 2 months ago');
  } else {
    console.log('ℹ️  Invoice for 2 months ago already exists');
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
