import { createServerClient } from "@supabase/ssr";
import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";

async function hasSupabaseSession(req: NextRequest): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return false;
  }

  return Boolean(user);
}

// 미들웨어에서는 NextAuth JWT token과 Supabase 세션을 병행 체크한다.
export default withAuth(
  async function proxy(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;
    const hasNextAuthToken = Boolean(token);
    const hasSupabaseAuth = hasNextAuthToken ? false : await hasSupabaseSession(req);
    const isAuthenticated = hasNextAuthToken || hasSupabaseAuth;
    const role = token?.role;

    // 1) 로그인 안 한 유저 → 로그인 페이지 빼고 모두 접근 불가
    if (!isAuthenticated && pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2) 로그인 한 유저 → 로그인 페이지 접근 불가
    if (isAuthenticated && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/admin")) {
      // 관리자 라우트는 NextAuth role 기반으로만 허용
      if (!hasNextAuthToken || role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/login",
    "/((?!_next|api|favicon.ico).*)", // 내부 리소스 제외하고 전체 감시
  ],
};
