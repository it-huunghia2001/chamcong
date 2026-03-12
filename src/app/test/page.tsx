import { prisma } from "@/lib/prisma";

export default async function TestPage() {
  // Thử đọc dữ liệu xem có bị lỗi mạng không
  try {
    const logs = await prisma.workLog.findMany();
    // eslint-disable-next-line react-hooks/error-boundaries
    return <div>Kết nối thành công! Số bản ghi: {logs.length}</div>;
  } catch (error) {
    return <div>Lỗi kết nối: {JSON.stringify(error)}</div>;
  }
}
