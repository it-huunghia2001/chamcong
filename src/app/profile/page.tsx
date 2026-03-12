import { getAuthUser, logout } from "@/lib/auth";
import { redirect } from "next/navigation";

// 1. Định nghĩa Action riêng (hoặc import từ file actions.ts)
async function handleLogout() {
  "use server"; // Khai báo action bên trong hàm
  await logout();
  redirect("/login");
}

// 2. Default export phải là một hàm (Component)
export default async function ProfilePage() {
  const user = await getAuthUser();

  // Nếu chưa đăng nhập, đá về trang login ngay từ server
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-6 max-w-lg mx-auto pb-24">
      {/* Card Thông tin User */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 text-center mb-6">
        <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl border-4 border-white shadow-lg">
          👨‍💻
        </div>
        <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">
          {user.username}
        </h2>
        <p className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
          Full-stack Developer
        </p>
      </div>

      {/* Thông số chi tiết */}
      <div className="space-y-3">
        <div className="bg-white p-5 rounded-3xl flex justify-between items-center shadow-sm border border-slate-50">
          <span className="text-slate-400 font-bold text-xs uppercase">
            Trạng thái
          </span>
          <span className="text-green-500 font-black text-[10px] uppercase bg-green-50 px-3 py-1 rounded-full">
            Online
          </span>
        </div>
        <div className="bg-white p-5 rounded-3xl flex justify-between items-center shadow-sm border border-slate-50">
          <span className="text-slate-400 font-bold text-xs uppercase">
            Khu vực
          </span>
          <span className="text-slate-800 font-black text-[10px] uppercase italic">
            Bình Dương
          </span>
        </div>
      </div>

      {/* Nút Đăng xuất */}
      <form action={handleLogout} className="mt-10">
        <button
          type="submit"
          className="w-full bg-red-50 text-red-600 py-5 rounded-[2rem] font-black text-xs tracking-widest border-2 border-red-100 active:scale-95 transition-all uppercase"
        >
          Đăng xuất hệ thống
        </button>
      </form>

      <p className="text-center mt-6 text-[10px] text-slate-300 font-medium">
        Version 1.0.0-Beta (Prisma 7)
      </p>
    </main>
  );
}
