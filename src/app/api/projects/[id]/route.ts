import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getUnifiedAuthUser } from "@/lib/auth/unifiedAuth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getUnifiedAuthUser();
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("project_id", id)
      .single();

    if (error) {
      console.error("❌ Project fetch error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
