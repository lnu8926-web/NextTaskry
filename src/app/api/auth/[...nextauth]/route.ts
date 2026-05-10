import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabase/server";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일 후 재로그인 필요
  },

  callbacks: {
    async signIn({ user }) {
      const email = user.email?.trim().toLowerCase();
      if (!email) return false;

      const now = new Date().toISOString();
      const userPayload = {
        user_name: user.name,
        profile_image: user.image,
        updated_at: now,
        is_active: true,
        auth_provider: "google",
      };

      try {
        // maybeSingle avoids treating "no row" as an exception path.
        const { data: existingUser, error: existingUserError } = await supabaseAdmin
          .from("users")
          .select("user_id, global_role")
          .eq("email", email)
          .maybeSingle();

        if (existingUserError) {
          console.error("[auth] failed to fetch user", existingUserError);
          return false;
        }

        if (!existingUser) {
          const { error: insertError } = await supabaseAdmin.from("users").insert({
            email,
            global_role: "user",
            ...userPayload,
          });

          if (insertError) {
            console.error("[auth] failed to create user", insertError);
            return false;
          }

          return true;
        }

        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update(userPayload)
          .eq("email", email);

        if (updateError) {
          console.error("[auth] failed to update user", updateError);
          return false;
        }

        return true;
      } catch (error) {
        console.error("[auth] unexpected signIn error", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      //처음 토큰 생성한 뒤 payload에 유저정보를 브라우저에 세션으로 넘겨주기위한 코드
      // 그 뒤 토큰 검증할때마다 실행될때는 user가 없기때문에 하위 코드는 실행되지않는다.
      if (user?.email) {
        const email = user.email.trim().toLowerCase();
        const { data: existingUser, error: existingUserError } = await supabaseAdmin
          .from("users")
          .select("user_id, global_role, user_name, email, profile_image")
          .eq("email", email)
          .maybeSingle();

        if (existingUserError) {
          console.error("[auth] failed to load user for jwt", existingUserError);
          return token;
        }

        if (existingUser) {
          token.user_id = existingUser.user_id;
          token.role = existingUser.global_role;
          token.user_name = existingUser.user_name;
          token.profile_image = existingUser.profile_image;
          token.email = existingUser.email;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.user_id = token.user_id;
        session.user.role = token.role;
        session.user.name = token.user_name;
        session.user.email = token.email;
        session.user.image = token.profile_image;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
