import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    // Đổi ở đây nè Nghĩa
    seed: "tsx prisma/seed.ts",
  },
});
