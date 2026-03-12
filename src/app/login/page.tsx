import { login } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";

    // LỖI CŨ: const success = await login(formData.token);
    // FIX: Phải dùng .get("tên_input") để lấy dữ liệu từ FormData
    const token = formData.get("token") as string;

    if (!token) return;

    const success = await login(token);

    if (success) {
      redirect("/");
    } else {
      // Bạn có thể xử lý báo lỗi ở đây nếu muốn
      console.log("Sai mã truy cập rồi Nghĩa ơi!");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter mb-2">
          X-LOGIN
        </h1>
        <p className="text-slate-400 text-sm font-medium">
          Nhập mã truy cập nội bộ của bạn
        </p>
      </div>

      <form action={handleLogin} className="w-full max-w-xs space-y-4">
        <input
          name="token"
          type="password"
          placeholder="Mã Token ví dụ là lớp diu"
          className="w-full p-5 bg-slate-100 rounded-3xl  focus:ring-2 focus:ring-blue-500! border-amber-600 border-2 font-bold text-center"
          required
        />
        <button className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all">
          XÁC NHẬN TRUY CẬP
        </button>
      </form>

      <p className="mt-10 text-[10px] text-slate-300 uppercase font-bold tracking-widest">
        Dành riêng cho vợ
      </p>
    </div>
  );
}
