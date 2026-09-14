import { PrismaClient } from '#/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

async function main() {
   console.log('🌱 Seeding...');

   // 1. Tạo categories
   const categories = await Promise.all([
      prisma.category.upsert({
         where: { name: 'Đồ uống' },
         update: {},
         create: { name: 'Đồ uống' },
      }),
      prisma.category.upsert({
         where: { name: 'Thực phẩm' },
         update: {},
         create: { name: 'Thực phẩm' },
      }),
      prisma.category.upsert({
         where: { name: 'Gia dụng' },
         update: {},
         create: { name: 'Gia dụng' },
      }),
   ]);

   // 2. Tạo products
   const productData = [
      { sku: 'SP001', name: 'Nước suối Aqua', category_id: categories[0].id, unit: 'thùng', price: 50000 },
      { sku: 'SP002', name: 'Coca Cola', category_id: categories[0].id, unit: 'thùng', price: 120000 },
      { sku: 'SP003', name: 'Mì gói Hảo Hảo', category_id: categories[1].id, unit: 'thùng', price: 85000 },
      { sku: 'SP004', name: 'Dầu ăn Neptune', category_id: categories[1].id, unit: 'chai', price: 45000 },
      { sku: 'SP005', name: 'Nước rửa chén', category_id: categories[2].id, unit: 'chai', price: 25000 },
   ];

   const products = [];
   for (const p of productData) {
      const product = await prisma.product.upsert({
         where: { sku: p.sku },
         update: {},
         create: p,
      });
      products.push(product);
   }

   // 3. Tạo warehouse
   const warehouse = await prisma.warehouse.upsert({
      where: { name: 'Kho Quận 7' },
      update: {},
      create: {
         name: 'Kho Quận 7',
         address: '123 Nguyễn Thị Thập, Q7, TP.HCM',
         latitude: 10.7340,
         longitude: 106.7220,
      },
   });

   // 4. Sinh stock_movements 6 tháng (180 ngày)
   const startDate = new Date('2026-03-01');
   const days = 180;

   console.log(`📦 Generating ${days} days of stock movements for ${products.length} products...`);

   for (const product of products) {
      // Upsert inventory
      await prisma.inventory.upsert({
         where: {
            product_id_warehouse_id: {
               product_id: product.id,
               warehouse_id: warehouse.id,
            },
         },
         update: {},
         create: {
            product_id: product.id,
            warehouse_id: warehouse.id,
            quantity: 10000, // bắt đầu với tồn kho lớn
            low_stock_threshold: 50,
         },
      });

      const movements = [];

      for (let d = 0; d < days; d++) {
         const date = new Date(startDate);
         date.setDate(date.getDate() + d);

         // Sinh quantity với pattern:
         // - Base demand: 20-50 tuỳ sản phẩm
         // - Weekly pattern: cuối tuần bán nhiều hơn
         // - Monthly spike: đầu tháng bán nhiều hơn
         // - Random noise: ±30%
         const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
         const dayOfMonth = date.getDate();

         let base = 30 + Math.floor(Math.random() * 20); // 30-50

         // Weekend boost (+40%)
         if (dayOfWeek === 0 || dayOfWeek === 6) {
            base = Math.floor(base * 1.4);
         }

         // Start of month boost (+25%)
         if (dayOfMonth <= 5) {
            base = Math.floor(base * 1.25);
         }

         // Gradual upward trend (+0.1% per day)
         base = Math.floor(base * (1 + d * 0.001));

         // Random noise ±30%
         const noise = 1 + (Math.random() - 0.5) * 0.6;
         const quantity = Math.max(1, Math.round(base * noise));

         movements.push({
            product_id: product.id,
            warehouse_id: warehouse.id,
            type: 'out' as const,
            quantity,
            created_at: date,
         });

         // Nhập kho định kỳ (mỗi tuần 1 lần, thứ 2)
         if (dayOfWeek === 1) {
            movements.push({
               product_id: product.id,
               warehouse_id: warehouse.id,
               type: 'in' as const,
               quantity: quantity * 7, // nhập đủ cho cả tuần
               created_at: date,
            });
         }
      }

      await prisma.stockMovement.createMany({ data: movements });
      console.log(`  ✓ ${product.name}: ${movements.length} movements`);
   }

   console.log('✅ Seed complete!');
}

main()
   .catch((e) => {
      console.error(e);
      process.exit(1);
   })
   .finally(() => prisma.$disconnect());
