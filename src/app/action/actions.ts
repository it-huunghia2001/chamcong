/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Hàm xử lý Check-in và Check-out chính
 * @param jobId ID của công việc được chọn (từ Toyota hoặc dự án khác)
 */
export async function handleToggleWork(jobId: number) {
  try {
    const user = await getAuthUser();
    if (!user) throw new Error("Hết phiên làm việc.");

    // Tìm ca làm đang mở của chính User này
    const activeLog = await prisma.workLog.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
    });

    const now = new Date();

    if (activeLog) {
      // --- CHỈ KẾT THÚC NẾU ĐÚNG JOB ĐANG CHẠY ---
      if (activeLog.jobId !== jobId) {
        throw new Error(
          "Bạn đang làm việc ở dự án khác, hãy kết thúc dự án đó trước.",
        );
      }

      const startTime = new Date(activeLog.startTime);
      const diffInMs = now.getTime() - startTime.getTime();
      const hours = parseFloat((diffInMs / (1000 * 60 * 60)).toFixed(2));

      await prisma.workLog.update({
        where: { id: activeLog.id },
        data: {
          endTime: now,
          totalHours: hours,
        },
      });
    } else {
      // --- CHỈ BẮT ĐẦU NẾU KHÔNG CÓ CA NÀO ĐANG CHẠY ---
      await prisma.workLog.create({
        data: {
          userId: user.id,
          jobId: jobId,
          startTime: now,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/history");
  } catch (error: any) {
    return { error: error.message };
  }
}

// Trong src/app/action/actions.ts
export async function createManualWorkLog(formData: FormData) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const jobId = Number(formData.get("jobId"));
  const dateStr = formData.get("date") as string;
  const startStr = formData.get("startTime") as string;
  const endStr = formData.get("endTime") as string;

  // Tạo object Date chuẩn cho Prisma
  const start = new Date(`${dateStr}T${startStr}:00`);
  const end = new Date(`${dateStr}T${endStr}:00`);

  if (start >= end) throw new Error("Giờ không hợp lệ");

  const hours = parseFloat(
    ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2),
  );

  await prisma.workLog.create({
    data: {
      userId: user.id,
      jobId,
      startTime: start,
      endTime: end,
      totalHours: hours,
    },
  });

  revalidatePath("/");
}

export async function deleteWorkLog(id: number) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.workLog.delete({
    where: { id, userId: user.id }, // Bảo mật: chỉ xoá đúng đồ của mình
  });

  revalidatePath("/");
  revalidatePath("/history");
}
