/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { deleteWorkLog } from "../action/actions";
import { redirect } from "next/navigation";
import dayjs from "@/lib/dayjs"; // Bản config Dayjs Việt Nam của Nghĩa

export default async function HistoryPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  // 1. Lấy mốc thời gian đầu tháng hiện tại theo giờ VN
  const nowVN = dayjs().tz();
  const startOfMonth = nowVN.startOf("month").toDate();

  // 2. Lấy toàn bộ lịch sử trong tháng (Đã kết thúc ca làm)
  const logs = await prisma.workLog.findMany({
    where: {
      userId: user.id,
      startTime: { gte: startOfMonth },
      endTime: { not: null },
    },
    include: { job: true },
    orderBy: { startTime: "desc" },
  });

  // 3. Thống kê theo từng dự án (Stats by Job)
  const statsByJob = logs.reduce((acc: any, log) => {
    const jobName = log.job.name;
    if (!acc[jobName]) {
      acc[jobName] = { hours: 0, money: 0, count: 0 };
    }
    const duration = log.totalHours || 0;
    acc[jobName].hours += duration;
    acc[jobName].money += duration * log.job.rate;
    acc[jobName].count += 1;
    return acc;
  }, {});

  return (
    <main className="p-5 max-w-lg mx-auto pt-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter">
          Báo cáo tháng {nowVN.format("M")}
        </h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
          {nowVN.format("MMMM YYYY")}
        </p>
      </div>

      {/* TỔNG QUAN THEO DỰ ÁN (Dạng Card Ngang) */}
      <div className="space-y-3 mb-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
          Tổng quan dự án
        </p>
        {Object.entries(statsByJob).map(([name, data]: any) => (
          <div
            key={name}
            className="bg-slate-900 p-5 rounded-[2rem] text-white shadow-xl shadow-slate-200 flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-sm text-blue-400 italic">{name}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                {data.count} ca • {data.hours.toFixed(1)} giờ
              </p>
            </div>
            <p className="text-lg font-black italic">
              {data.money.toLocaleString("vi-VN")}đ
            </p>
          </div>
        ))}
      </div>

      {/* DANH SÁCH CHI TIẾT NHẬT KÝ */}
      <div className="space-y-4">
        <div className="flex justify-between items-center pl-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Nhật ký chi tiết
          </p>
          <span className="text-[9px] font-bold text-slate-300">
            MỚI NHẤT TRÊN CÙNG
          </span>
        </div>

        {logs.map((log) => (
          <div
            key={log.id}
            className="group bg-white p-5 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all shadow-sm active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {dayjs(log.startTime).tz().format("DD/MM")}
                </div>
                <h4 className="font-bold text-slate-800 text-sm italic">
                  {log.job.name}
                </h4>
              </div>

              <form
                action={async () => {
                  "use server";
                  await deleteWorkLog(log.id);
                }}
              >
                <button
                  className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Xoá bản ghi"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </form>
            </div>

            <div className="flex justify-between items-end bg-slate-50 p-3 rounded-2xl">
              <div className="text-[11px] font-bold text-slate-500">
                <span className="text-slate-400 font-medium">GIỜ:</span>{" "}
                {dayjs(log.startTime).tz().format("HH:mm")}
                <span className="mx-2 text-slate-300">→</span>
                {dayjs(log.endTime).tz().format("HH:mm")}
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-blue-600">
                  +{log.totalHours?.toFixed(1)}H
                </p>
                <p className="text-[9px] font-bold text-slate-400 italic">
                  +
                  {((log.totalHours || 0) * log.job.rate).toLocaleString(
                    "vi-VN",
                  )}
                  đ
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trạng thái trống */}
      {logs.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            Chưa có dữ liệu trong tháng {nowVN.format("M")}
          </p>
        </div>
      )}
    </main>
  );
}
