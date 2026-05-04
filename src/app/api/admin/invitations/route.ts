import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
const { data, error } = await supabaseAdmin
  .from("project_invitation_new")
  .select(`
    invitation_id,
    invitation_type,
    invited_email,
    invited_by,
    project_id,
    project_role,
    status,
    created_at,
    updated_at,
    projects:project_id (
      project_name
    )
  `)
  .order("created_at", { ascending: false });
    if (error) {
      console.error("초대 조회 오류:", error);
      return NextResponse.json(
        { error: "초대 목록 조회 실패" },
        { status: 500 }
      );
    }
  //project_id 를 기준으로해서 projects 테이블에서 project_name가져온다. join

  console.log(data,"data")

    // 프로젝트 이름을 편하게 쓰도록 평탄화(flatten)
const formatted = data.map((row) => ({
  invitation_id: row.invitation_id,
  invitation_type: row.invitation_type,
  invited_email: row.invited_email,
  invited_by: row.invited_by,
  project_id: row.project_id,
  project_role: row.project_role,
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at,
  project_name: (row.projects as unknown as { project_name: string } | null)?.project_name ?? null,
}));



    return NextResponse.json(formatted);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}



export async function POST(req: Request) {
  try {
    const body = await req.json();

   
    const {
      invitation_type, // "service_only" | "project"
      email,
      project_id,    //프로젝트 초대일때만사용
      project_role, //프로젝트 초대일때만사용
      invited_by, // 관리자 user_id
    } = body;

    //email, 초대타입 필수!
    if (!email || !invitation_type) {
      return NextResponse.json(
        { error: "email 또는 invitation_type 누락됨" },
        { status: 400 }
      );
    }

    //이미 가입한 유저 초대 불가 - 초대 거절한 사람도 이미 가입은 진행된 상태라 재초대는 불가능 ( 초대는 무조건 신규회원 대상)
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 가입한 유저입니다. 초대할 수 없습니다." },
        { status: 400 }
      );
    }



    
    // 1. 중복 초대 검사 - 초대는 보냈지만 pendding 상태 수락 아직 안한 상태 재초대 불가
    // const query = supabaseAdmin
    const {data: existingInvite} = await supabaseAdmin
      .from("project_invitation_new")
      // .select("invitation_id, status, invitation_type, project_id")
      .select("invitation_id")
      .eq("invited_email", email)
      .eq("status", "pending")
      .maybeSingle();

    //   //같은 프로젝트에 초대가 된 적이 있는지 중독체크
    // if (invitation_type === "project") {
    //   query.eq("project_id", project_id);
    // } else {
    //   query.eq("invitation_type", "service_only");
    // } //서비스초대는 프로젝트 체크 필요없음

    // const { data: existingInvite } = await query.maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: "이미 pending 상태의 초대가 존재합니다." },
        { status: 400 }
      );
    }

    // -----------------------------
    // 2. insert
    // -----------------------------
    const insertPayload: any = {
      invitation_type,
      invited_email: email,
      invited_by,
      status: "pending",
    };

    if (invitation_type === "project") {
      insertPayload.project_id = project_id;
      insertPayload.project_role = project_role;
    }

    const { data, error } = await supabaseAdmin
      .from("project_invitation_new")
      .insert(insertPayload)
      .select("invitation_id")
      .single();

    if (error || !data) {
      console.error("DB insert error:", error);
      return NextResponse.json(
        { error: "초대 생성 실패" },
        { status: 500 }
      );
    }

    //초대id url 로 전달
    const invitationId = data.invitation_id;



    // 3. 이메일 발송 (Supabase Auth 초대 이메일)
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login?invite=${invitationId}`;

    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: inviteUrl,
    });

    if (inviteError) {
      console.error("이메일 발송 오류:", inviteError);
      // 이메일 발송 실패 시 초대 레코드 삭제
      await supabaseAdmin
        .from("project_invitation_new")
        .delete()
        .eq("invitation_id", invitationId);
      return NextResponse.json(
        { error: "이메일 발송 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      invitationId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
