import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type UnifiedAuthUser = {
    isAuthenticated: boolean;
    provider: "nextauth" | "supabase" | null;
    email: string | null;
    userId: string | null;
    role: string | null;
};

const UNAUTHENTICATED_USER: UnifiedAuthUser = {
    isAuthenticated: false,
    provider: null,
    email: null,
    userId: null,
    role: null,
};

export async function getUnifiedAuthUser(): Promise<UnifiedAuthUser> {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.email) {
            return {
                isAuthenticated: true,
                provider: "nextauth",
                email: session.user.email ?? null,
                userId: session.user.user_id ?? null,
                role: session.user.role ?? null,
            };
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll() {},
                },
            }
        );

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (!error && user) {
            return {
                isAuthenticated: true,
                provider: "supabase",
                email: user.email ?? null,
                userId: user.id ?? null,
                role: null,
            };
        }

        return UNAUTHENTICATED_USER;

    } catch {
        return UNAUTHENTICATED_USER;
    }
}