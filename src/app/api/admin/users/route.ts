import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";


//user 정보 조회
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const {data, error} = await supabaseAdmin
    .from("users")
    .select(`user_name,email,global_role,user_id`)

    if (error) {
          console.error("Supabase error:", error);
          return NextResponse.json({ error: "DB error" }, { status: 500 });
        }

    return NextResponse.json(data)


  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }  
}


