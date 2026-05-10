// src/lib/supabase/auth.ts
// Supabase OAuth 관련 함수들을 모아둔 파일

"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { Session, AuthError } from "@supabase/supabase-js";

interface SupabaseAuthResponse {
    data?: Session | null;
    error?: AuthError | null;
}


/**
 * Supabase Google OAuth 로그인 함수
 * @returns {Promise<SupabaseAuthResponse>} 로그인 결과를 담은 객체
 */
export async function signInWithSupabaseGoogle() {
    try{
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error("Supabase Google OAuth 로그인 실패:", error);
            return { error };
        }

        return { data };
    } catch (error) {
        console.error("Supabase Google OAuth 로그인 중 예외 발생:", error);
        return { error };
    }
}

export async function handleAuthCallback(code: string) {
    try {
     // 전달받은 code를 사용하여 세션 정보(Access Token 등)를 교환
        const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("Supabase 액세스 토큰 교환 실패:", error);
            
            return { data, error };
        }

        return { data };
    } catch (error) {
        console.error("Supabase 액세스 토큰 교환 중 예외 발생:", error);
        return { error };
    }
}