import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth/adminAuth";

export async function GET() {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.error;

    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("project_id, project_name")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
