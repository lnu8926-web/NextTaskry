import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/adminAuth";

export async function GET() {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.error;

    const { data, error } = await supabaseAdmin
      .from("users")
      .select(`user_name,email,global_role,user_id`);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



