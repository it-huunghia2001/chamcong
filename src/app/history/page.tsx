/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { deleteWorkLog } from "../action/actions";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  // Lấy toàn bộ lịch sử trong tháng hiện tại
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const logs = await prisma.workLog.findMany({
    where: {
      userId: user.id,
      startTime: { gte: startOfMonth },
      endTime: { not: null },
    },
    include: { job: true },
    orderBy: { startTime: "desc" },
  });

  // Thống kê theo từng Job
  const statsByJob = logs.reduce((acc: any, log) => {
    const jobName = log.job.name;
    if (!acc[jobName]) acc[jobName] = { hours: 0, money: 0 };
    acc[jobName].hours += log.totalHours || 0;
    acc[jobName].money += (log.totalHours || 0) * log.job.rate;
    return acc;
  }, {});

  return (
    <main className="p-5 max-w-lg mx-auto pt-8 pb-24">
      <h1 className="text-2xl font-black italic mb-6 uppercase tracking-tighter">
        Báo cáo tháng {now.getMonth() + 1}
      </h1>

      {/* TỔNG QUAN THEO DỰ ÁN */}
      <div className="space-y-3 mb-10">
        {Object.entries(statsByJob).map(([name, data]: any) => (
          <div
            key={name}
            className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{name}</h3>
              <p className="text-[10px] text-slate-400 font-bold">
                {data.hours.toFixed(1)} Giờ làm việc
              </p>
            </div>
            <p className="font-black text-blue-600 italic">
              {data.money.toLocaleString("vi-VN")}đ
            </p>
          </div>
        ))}
      </div>

      {/* DANH SÁCH CHI TIẾT */}
      <div className="space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
          Chi tiết nhật ký
        </p>
        {logs.map((log) => (
          <div
            key={log.id}
            className="group bg-white p-5 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all relative"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                  {new Date(log.startTime).toLocaleDateString("vi-VN")}
                </span>
                <h4 className="font-bold text-slate-800 mt-1">
                  {log.job.name}
                </h4>
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteWorkLog(log.id);
                }}
              >
                <button className="text-slate-300 hover:text-red-500 transition-colors text-xs font-bold">
                  XOÁ
                </button>
              </form>
            </div>

            <div className="flex justify-between items-end">
              <p className="text-[11px] text-slate-400 font-medium">
                {new Date(log.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" → "}
                {new Date(log.endTime!).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm font-black text-slate-700">
                +{log.totalHours?.toFixed(1)}h
              </p>
            </div>
          </div>
        ))}
      </div>

      {logs.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold text-sm">
            Chưa có dữ liệu tháng này
          </p>
        </div>
      )}
    </main>
  );
}
