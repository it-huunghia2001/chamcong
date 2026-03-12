/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Thêm hoặc cập nhật Dự án (Toyota/Dự án khí)
export async function upsertJob(formData: FormData) {
  const id = formData.get("id") ? Number(formData.get("id")) : undefined;
  const name = formData.get("name") as string;
  const rate = Number(formData.get("rate"));

  if (id) {
    await prisma.job.update({
      where: { id },
      data: { name, rate },
    });
  } else {
    await prisma.job.create({
      data: { name, rate },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteJob(id: number) {
  try {
    // Kiểm tra xem có WorkLog nào không
    const count = await prisma.workLog.count({ where: { jobId: id } });

    if (count > 0) {
      // Tùy chọn 1: Không cho xóa nếu đã có dữ liệu chấm công
      throw new Error(
        `Không thể xóa dự án này vì đã có ${count} lượt chấm công.`,
      );

      // Tùy chọn 2 (Nếu muốn xóa hết):
      // await prisma.workLog.deleteMany({ where: { jobId: id } });
    }

    await prisma.job.delete({ where: { id } });
    revalidatePath("/admin");
  } catch (error: any) {
    return { error: error.message };
  }
}

// ACTION QUẢN LÝ NGƯỜI DÙNG
export async function deleteUser(id: number) {
  const count = await prisma.workLog.count({ where: { userId: id } });
  if (count > 0) {
    throw new Error("Không thể xóa nhân viên đã có dữ liệu làm việc.");
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function createUser(formData: FormData) {
  const username = formData.get("username") as string;
  const token = formData.get("token") as string;
  const password = "123"; // Mặc định, có thể đổi sau

  await prisma.user.create({
    data: { username, token, password },
  });
  revalidatePath("/admin");
}
