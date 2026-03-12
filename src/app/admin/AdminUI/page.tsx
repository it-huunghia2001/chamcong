/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createUser,
  deleteJob,
  deleteUser,
  upsertJob,
} from "@/app/action/admin-actions";
import { useState } from "react";

// Lưu ý: Nghĩa cần fetch dữ liệu từ Server Component rồi truyền vào đây
// Hoặc dùng trực tiếp nếu file này vẫn là Server Component (bỏ useState và dùng cuộn dọc)
// Ở đây mình viết theo hướng tối ưu UI cuộn dọc cho mobile dễ dùng nhất:

export default function AdminMobilePage({ jobs = [], users = [] }: any) {
  const [activeTab, setActiveTab] = useState("jobs");

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4 border-b border-slate-100">
        <h1 className="text-xl font-black italic tracking-tighter uppercase text-slate-900">
          Admin Control
        </h1>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mt-4">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === "jobs" ? "bg-white shadow-sm text-blue-600" : "text-slate-400"}`}
          >
            Dự án ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === "users" ? "bg-white shadow-sm text-blue-600" : "text-slate-400"}`}
          >
            Nhân sự ({users.length})
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === "jobs" ? (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Form Thêm Dự Án */}
            <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-100">
              <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">
                Thêm chi nhánh Toyota mới
              </h2>
              <form action={upsertJob} className="space-y-3">
                <input
                  name="name"
                  placeholder="Tên chi nhánh"
                  className="w-full p-4 bg-white/10 rounded-2xl border-none outline-none placeholder:text-white/40 font-bold text-sm"
                  required
                />
                <div className="flex gap-2">
                  <input
                    name="rate"
                    type="number"
                    placeholder="Đơn giá/h"
                    className="flex-1 p-4 bg-white/10 rounded-2xl border-none outline-none placeholder:text-white/40 font-bold text-sm"
                    required
                  />
                  <button className="bg-white text-blue-600 px-6 rounded-2xl font-black text-xs uppercase active:scale-95 transition-all">
                    Lưu
                  </button>
                </div>
              </form>
            </div>

            {/* List Dự Án */}
            <div className="space-y-3">
              {jobs.map((job: any) => (
                <div
                  key={job.id}
                  className="bg-white p-4 rounded-3xl flex justify-between items-center shadow-sm border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs">
                      {job.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {job.name}
                      </p>
                      <p className="text-[10px] text-blue-500 font-black">
                        {job.rate.toLocaleString()}đ/h
                      </p>
                    </div>
                  </div>
                  <form
                    action={async () => {
                      if (confirm("Xóa dự án này?")) await deleteJob(job.id);
                    }}
                  >
                    <button className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-red-500">
                      <TrashIcon />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Form Thêm User */}
            <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-lg shadow-slate-200">
              <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">
                Tạo tài khoản nhân viên
              </h2>
              <form action={createUser} className="space-y-3">
                <input
                  name="username"
                  placeholder="Tên nhân viên"
                  className="w-full p-4 bg-white/5 rounded-2xl border-none outline-none placeholder:text-white/20 font-bold text-sm"
                  required
                />
                <div className="flex gap-2">
                  <input
                    name="token"
                    placeholder="Mã truy cập"
                    className="flex-1 p-4 bg-white/5 rounded-2xl border-none outline-none placeholder:text-white/20 font-bold text-sm"
                    required
                  />
                  <button className="bg-white text-slate-900 px-6 rounded-2xl font-black text-xs uppercase active:scale-95 transition-all">
                    Tạo
                  </button>
                </div>
              </form>
            </div>

            {/* List User */}
            <div className="space-y-3">
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className="bg-white p-4 rounded-3xl flex justify-between items-center shadow-sm border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm italic">
                        {user.username}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold">
                        Mã: {user.token} • {user._count.workLogs} ca làm
                      </p>
                    </div>
                  </div>
                  <form
                    action={async () => {
                      if (confirm("Xóa nhân viên này?"))
                        await deleteUser(user.id);
                    }}
                  >
                    <button className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-red-500">
                      <TrashIcon />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

// Icon xóa đơn giản
function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
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
  );
}
