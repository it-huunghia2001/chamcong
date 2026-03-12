import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Lấy token từ Cookie (Đây là cách an toàn nhất cho SSR)
  const token = request.cookies.get("auth_token")?.value;
  console.log(token);

  const { pathname } = request.nextUrl;

  // 2. Định nghĩa các trang không cần check token (Public)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.includes("/api/auth")
  ) {
    return NextResponse.next();
  }

  // 3. Nếu chưa có token -> Đá về trang Login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // Lưu lại trang định vào để sau khi login xong thì quay lại (Optional)
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Nếu đã có token và đang ở trang Login -> Đá về trang chủ
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// 5. Cấu hình các route sẽ chạy qua Middleware này
export const config = {
  matcher: [
    /*
     * Match tất cả các route trừ:
     * - api (các API route)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
