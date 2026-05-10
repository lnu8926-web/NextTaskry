// src/app/auth/callback/route.ts
import { NextRequest,NextResponse } from "next/server";
import { handleAuthCallback } from "@/lib/supabase/auth";

/**
 * GET 핸들러

    파라미터: req: NextRequest

    처리 순서:

    req.nextUrl.searchParams.get("code")로 code 추출
    code가 없으면 → /login?error=missing_code로 리다이렉트
    handleAuthCallback(code) 호출
    결과에 error가 있으면 → /login?error=auth_failed로 리다이렉트
    성공이면 → /로 리다이렉트
    에러 처리:

    try-catch로 전체를 감싸기
    catch 블록에서 → /login?error=server_error로 리다이렉트
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=missing_code", req.url));
    }

    const { error } = await handleAuthCallback(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
    }

    return NextResponse.redirect(new URL("/", req.url));
  } catch (error) {
    console.error("Authentication callback error:", error);
    return NextResponse.redirect(new URL("/login?error=server_error", req.url));
  }
}