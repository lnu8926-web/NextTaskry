import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "@/lib/supabase/server";

const GUEST_EMAIL = "guest@taskry.demo";
const GUEST_NAME = "게스트";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {},
      async authorize() {
        return {
          id: GUEST_EMAIL,
          email: GUEST_EMAIL,
          name: GUEST_NAME,
          image: null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일 후 재로그인 필요
  },

  callbacks: {
    async signIn({ user, account }) {
      const email = user.email;
      const provider = account?.provider ?? "unknown";

      if (!email) return false;

      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (existingUser?.global_role === "admin") {
        await supabaseAdmin
          .from("users")
          .update({
            user_name: user.name,
            profile_image: user.image,
            updated_at: new Date().toISOString(),
            is_active: true,
            auth_provider: provider,
          })
          .eq("email", email);

        return true;
      }

      if (!existingUser) {
        await supabaseAdmin.from("users").insert({
          email: user.email,
          user_name: user.name,
          profile_image: user.image,
          global_role: "user",
          auth_provider: provider,
          is_active: true,
          updated_at: new Date().toISOString(),
        });

        return true;
      }

      await supabaseAdmin
        .from("users")
        .update({
          user_name: user.name,
          profile_image: user.image,
          updated_at: new Date().toISOString(),
          is_active: true,
          auth_provider: provider,
        })
        .eq("email", email);

      return true;
    },

    async jwt({ token, user }) {
      //처음 토큰 생성한 뒤 payload에 유저정보를 브라우저에 세션으로 넘겨주기위한 코드
      // 그 뒤 토큰 검증할때마다 실행될때는 user가 없기때문에 하위 코드는 실행되지않는다.
      if (user) {
        // DB에서 유저 조회
        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("user_id, global_role, user_name, email, profile_image")
          .eq("email", user.email)
          .single();

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
