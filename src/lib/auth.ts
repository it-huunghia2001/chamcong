"use server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  return await prisma.user.findUnique({
    where: { token },
  });
}

export async function login(username: string) {
  // Tìm user (Đơn giản hóa cho dev, bạn nên check password)
  const user = await prisma.user.findUnique({ where: { token: username } });
  if (!user) return null;

  // Lưu cookie 10 năm
  (await cookies()).set("auth_token", user.token!, {
    maxAge: 60 * 60 * 24 * 365 * 10,
    path: "/",
  });

  return user;
}

export async function logout() {
  (await cookies()).delete("auth_token");
}
