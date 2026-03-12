import { prisma } from "@/lib/prisma";
import AdminMobilePage from "./AdminUI/page";

export default async function AdminPage() {
  // Fetch data trực tiếp từ Database
  const jobs = await prisma.job.findMany({ orderBy: { id: "asc" } });
  const users = await prisma.user.findMany({
    include: { _count: { select: { workLogs: true } } },
  });

  // Truyền data xuống Client Component
  return <AdminMobilePage jobs={jobs} users={users} />;
}
