/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "../prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

// 1. Khởi tạo Adapter cho Seed
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);

// 2. Truyền adapter vào constructor để hết lỗi TS(2554)
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Đang bắt đầu seed dữ liệu...");

  // Tạo tài khoản Admin (Nghĩa)
  const admin = await prisma.user.upsert({
    where: { username: "nghia_admin" },
    update: {},
    create: {
      username: "nghia_admin",
      password: "password123",
      token: "vinh-vien-123456",
    },
  });
  console.log(`✅ Đã tạo Admin: ${admin.username}`);

  // Tạo các loại công việc mẫu cho Toyota & Môi trường
  const jobs = [
    { name: "Toyota Bình Dương", rate: 50000 },
    { name: "Toyota Mỹ Phước", rate: 50000 },
    { name: "Hệ thống Đo Không Khí", rate: 65000 },
  ];

  for (const [index, job] of jobs.entries()) {
    await prisma.job.upsert({
      where: { id: index + 1 },
      update: { rate: job.rate },
      create: job,
    });
  }
  console.log("✅ Đã tạo các danh mục công việc mẫu.");
  console.log("🚀 Seed dữ liệu hoàn tất!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Đóng kết nối pool sau khi hoàn tất
  });
