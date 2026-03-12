/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "../../prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const prismaClientSingleton = () => {
  // 1. Tạo Pool kết nối từ thư viện 'pg'
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  // 2. Tạo Adapter (Bắt buộc từ Prisma 7)
  // Chúng ta dùng 'as any' để tránh xung đột kiểu dữ liệu giữa các phiên bản @types/pg
  const adapter = new PrismaPg(pool as any);

  // 3. Khởi tạo Client với adapter - Hết lỗi 0 arguments
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
