"use client";

import Link from "next/link";
import "./globals.css";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Ẩn thanh điều hướng nếu là trang Login
  const isLoginPage = pathname === "/login";

  // Hàm check active link để đổi màu
  const isActive = (path: string) => pathname === path;

  return (
    <html lang="vi">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}

        {!isLoginPage && (
          <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 flex justify-around p-3 z-50 rounded-[2.5rem] shadow-2xl shadow-slate-400">
            <NavItem
              href="/"
              icon="⚡"
              label="LÀM VIỆC"
              active={isActive("/")}
            />
            <NavItem
              href="/history"
              icon="📊"
              label="THỐNG KÊ"
              active={isActive("/history")}
            />
            <NavItem
              href="/admin"
              icon="⚙️"
              label="QUẢN LÝ"
              active={isActive("/admin")}
            />
            <NavItem
              href="/profile"
              icon="👤"
              label="CÁ NHÂN"
              active={isActive("/profile")}
            />
          </nav>
        )}
      </body>
    </html>
  );
}

// Component con để code sạch hơn
function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
        active ? "scale-110" : "opacity-40 grayscale"
      }`}
    >
      <span
        className={`text-xl ${active ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""}`}
      >
        {icon}
      </span>
      <span
        className={`text-[9px] font-black tracking-tighter ${active ? "text-white" : "text-slate-400"}`}
      >
        {label}
      </span>
      {active && (
        <div className="w-1 h-1 bg-blue-400 rounded-full absolute -bottom-1 shadow-[0_0_8px_#60a5fa]" />
      )}
    </Link>
  );
}
