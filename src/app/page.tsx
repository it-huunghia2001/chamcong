import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { handleToggleWork, createManualWorkLog } from "./action/actions";

export default async function HomePage() {
  const user = await getAuthUser();
  const jobs = await prisma.job.findMany();

  // 1. Lấy ca làm việc đang chạy
  const activeLog = await prisma.workLog.findFirst({
    where: { userId: user?.id, endTime: null },
    include: { job: true },
  });

  // 2. Tính toán Stats từ Database (Ví dụ lấy trong tháng này)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const logs = await prisma.workLog.findMany({
    where: {
      userId: user?.id,
      startTime: { gte: startOfMonth },
      endTime: { not: null },
    },
    include: { job: true },
  });

  const totalHours = logs.reduce((sum, log) => sum + (log.totalHours || 0), 0);
  const totalEarnings = logs.reduce(
    (sum, log) => sum + (log.totalHours || 0) * log.job.rate,
    0,
  );

  return (
    <main className="p-5 max-w-lg mx-auto pt-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter">
            CHẤM CÔNG
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            APP CHO VỢ
          </p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-full border-2 border-blue-500 flex items-center justify-center text-xl shadow-lg shadow-blue-100">
          👨‍💻
        </div>
      </div>

      {/* Stats Card - Tính toán thật */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl shadow-slate-200">
          <p className="text-[10px] font-black opacity-50 uppercase mb-1">
            Tháng này
          </p>
          <p className="text-2xl font-black">
            {totalHours.toFixed(1)}{" "}
            <span className="text-xs opacity-50">Giờ</span>
          </p>
        </div>
      </div>

      {activeLog ? (
        // CARD ĐANG LÀM VIỆC
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-orange-100 border border-orange-50 text-center mb-8">
          <div className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black mb-4 animate-pulse">
            ĐANG GHI GIỜ • {activeLog.job.name.toUpperCase()}
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            {activeLog.job.name}
          </h2>
          <p className="text-slate-400 text-sm mb-8 font-medium">
            Bắt đầu: {new Date(activeLog.startTime).toLocaleTimeString("vi-VN")}
          </p>
          <form
            action={async () => {
              "use server";
              await handleToggleWork(activeLog.jobId);
            }}
          >
            <button className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-sm tracking-widest active:scale-95 transition-all uppercase">
              KẾT THÚC CÔNG VIỆC
            </button>
          </form>
        </div>
      ) : (
        // CHỌN DỰ ÁN NHANH
        <div className="space-y-4 mb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
            Chọn nơi làm việc
          </p>
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
                  {job.name.includes("Toyota") ? "🚗" : "🍃"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {job.name}
                  </h3>
                  <p className="text-[10px] text-blue-500 font-black uppercase">
                    {job.rate.toLocaleString()}đ / h
                  </p>
                </div>
              </div>
              <form
                action={async () => {
                  "use server";
                  await handleToggleWork(job.id);
                }}
              >
                <button className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-900 w-10 h-10 rounded-full flex items-center justify-center transition-all">
                  <span className="font-bold">→</span>
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* SECTION: NHẬP BÙ GIỜ THỦ CÔNG */}
      <div className="border-t border-dashed border-slate-200 pt-8 mt-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-4">
          Quên chấm công? Nhập bù
        </h3>
        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
          <form action={createManualWorkLog} className="space-y-4">
            <select
              name="jobId"
              className="w-full p-4 bg-white rounded-2xl border-none font-bold text-sm shadow-sm outline-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>

            <input
              name="date"
              type="date"
              required
              className="w-full p-4 bg-white rounded-2xl border-none font-bold text-sm shadow-sm outline-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 ml-2 uppercase">
                  Giờ vào
                </label>
                <input
                  name="startTime"
                  type="time"
                  required
                  className="w-full p-4 bg-white rounded-2xl border-none font-bold text-sm shadow-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 ml-2 uppercase">
                  Giờ ra
                </label>
                <input
                  name="endTime"
                  type="time"
                  required
                  className="w-full p-4 bg-white rounded-2xl border-none font-bold text-sm shadow-sm outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-blue-600 border-2 border-blue-100 py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all uppercase"
            >
              Xác nhận bù giờ
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
