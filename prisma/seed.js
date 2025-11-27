"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const hash_util_1 = require("../src/Utils/hash.util");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    const adminPassword = await (0, hash_util_1.hashPassword)('Admin123$');
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
                role: client_1.UserRole.ADMIN,
            },
        });
        console.log('✅ Admin user created:', admin.email);
    }
    else {
        console.log('ℹ️  Admin user already exists:', adminEmail);
    }
    const settings = [
        { key: client_1.ProductType.MONTHLY_BILL, value: '1000' },
        { key: client_1.ProductType.LATE_SURCHARGE, value: '100' },
    ];
    for (const setting of settings) {
        const existing = await prisma.settings.findUnique({
            where: { key: setting.key },
        });
        if (!existing) {
            await prisma.settings.create({
                data: setting,
            });
            console.log(`✅ Setting created: ${setting.key} = ${setting.value}`);
        }
        else {
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
//# sourceMappingURL=seed.js.map