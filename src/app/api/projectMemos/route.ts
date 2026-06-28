import { supabaseAdmin } from "@/lib/supabase/server";
import { getUnifiedAuthUser } from "@/lib/auth/unifiedAuth";
import type { ProjectMemo } from "@/types/projectMemo";

const supabase = supabaseAdmin;

// ============================================
// 타입
// ============================================
interface ApiError {
  error: string;
  status: number;
}

// ============================================
// 유틸 함수
// ============================================

/**
 * 현재 인증된 사용자 ID 가져오기
 */
async function getAuthUserId() {
  const authUser = await getUnifiedAuthUser();

  if (!authUser.isAuthenticated || !authUser.userId) {
    throw {
      error: "인증이 필요합니다",
      status: 401,
    };
  }

  return authUser.userId;
}

/**
 * 메모 조회 (상세 정보 포함)
 */
async function getMemoById(memoId: string) {
  const { data: memo, error } = await supabase
    .from("project_memos")
    .select("*")
    .eq("memo_id", memoId)
    .single();

  if (error || !memo) {
    throw {
      error: "해당 메모를 찾을 수 없습니다",
      status: 404,
    };
  }

  return memo;
}

/**
 * 작성자 권한 확인
 */
function checkAuthor(memo: ProjectMemo, userId: string) {
  if (memo.user_id !== userId) {
    throw {
      error: "권한이 없습니다 (작성자만 가능)",
      status: 403,
    };
  }
}

/**
 * 에러 응답 생성
 */
function errorResponse(error: unknown, defaultMessage: string) {
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    "status" in error
  ) {
    const apiError = error as ApiError;
    return Response.json({ error: apiError.error }, { status: apiError.status });
  }

  console.error("API error:", error);
  return Response.json({ error: defaultMessage }, { status: 500 });
}

// ============================================
// API 엔드포인트
// ============================================

/**
 * GET /api/projectMemos
 * 프로젝트별 메모 목록 조회 (작성자 정보 포함)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = (searchParams.get("sortBy") || "newest") as
      | "newest"
      | "oldest";
    const userId = searchParams.get("userId");
    const search = searchParams.get("search")?.trim() || "";
    const pinnedOnly = searchParams.get("pinned_only") === "true";

    if (!projectId) {
      return Response.json(
        { error: "프로젝트 ID가 필수입니다" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;
    const orderDirection = sortBy === "newest" ? "desc" : "asc";

    const safeSearch = search.replace(/[,%()]/g, " ");
    let matchingAuthorIds: string[] = [];
    if (safeSearch) {
      const { data: matchingUsers } = await supabase
        .from("users")
        .select("user_id")
        .or(`user_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
      matchingAuthorIds = matchingUsers?.map((user) => user.user_id) || [];
    }

    let memoQuery = supabase
      .from("project_memos")
      .select("*", { count: "exact" })
      .eq("project_id", projectId)
      .eq("is_deleted", false);

    if (userId) memoQuery = memoQuery.eq("user_id", userId);
    if (pinnedOnly) memoQuery = memoQuery.eq("is_pinned", true);
    if (safeSearch) {
      const authorFilter =
        matchingAuthorIds.length > 0
          ? `,user_id.in.(${matchingAuthorIds.join(",")})`
          : "";
      memoQuery = memoQuery.or(
        `content.ilike.%${safeSearch}%${authorFilter}`
      );
    }

    const {
      data: memos,
      error: fetchError,
      count,
    } = await memoQuery
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: orderDirection === "asc" })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error("Supabase error:", fetchError);
      return Response.json(
        { error: "메모 조회에 실패했습니다" },
        { status: 500 }
      );
    }

    const userIds = [...new Set(memos?.map((m) => m.user_id) || [])];

    const userMap: Record<string, { user_id: string; user_name: string; email: string }> = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("user_id, user_name, email")
        .in("user_id", userIds);

      users?.forEach((user) => {
        userMap[user.user_id] = user;
      });
    }

    const memosWithAuthor = memos?.map((memo) => ({
      ...memo,
      author: userMap[memo.user_id] || {
        user_id: memo.user_id,
        user_name: "알 수 없음",
        email: "",
      },
    }));

    return Response.json(
      {
        data: memosWithAuthor || [],
        total: count || 0,
        page,
        limit,
        hasMore: page * limit < (count || 0),
      },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error, "메모 조회에 실패했습니다");
  }
}

/**
 * POST /api/projectMemos
 * 메모 생성
 */
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    const body = await request.json();
    const { project_id, content } = body;

    if (!project_id || !content) {
      return Response.json(
        { error: "project_id와 content는 필수입니다" },
        { status: 400 }
      );
    }

    const now = new Date();
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("project_memos")
      .insert([
        {
          project_id,
          user_id: userId,
          content: content.trim(),
          created_at: kstTime.toISOString(),
          updated_at: kstTime.toISOString(),
          is_pinned: false,
          pinned_at: null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const { data: author } = await supabase
      .from("users")
      .select("user_id, user_name, email")
      .eq("user_id", userId)
      .single();

    const memoWithAuthor = {
      ...data,
      author: author || {
        user_id: userId,
        user_name: "알 수 없음",
        email: "",
      },
    };

    return Response.json(memoWithAuthor, { status: 201 });
  } catch (error) {
    return errorResponse(error, "메모 저장에 실패했습니다");
  }
}

/**
 * PUT /api/projectMemos
 * 메모 수정 (작성자만 가능)
 */
export async function PUT(request: Request) {
  try {
    const userId = await getAuthUserId();
    const { searchParams } = new URL(request.url);
    const memoId = searchParams.get("memoId");
    const body = await request.json();
    const { content } = body;

    if (!memoId) {
      return Response.json({ error: "메모 ID가 필수입니다" }, { status: 400 });
    }

    if (!content) {
      return Response.json(
        { error: "메모 내용이 필수입니다" },
        { status: 400 }
      );
    }

    const memo = await getMemoById(memoId);
    checkAuthor(memo, userId);

    const { data, error } = await supabase
      .from("project_memos")
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("memo_id", memoId)
      .select()
      .single();

    if (error) throw error;

    return Response.json(data, { status: 200 });
  } catch (error) {
    return errorResponse(error, "메모 수정에 실패했습니다");
  }
}

/**
 * DELETE /api/projectMemos
 * 메모 삭제 (소프트 삭제, 작성자만 가능)
 */
export async function DELETE(request: Request) {
  try {
    const userId = await getAuthUserId();
    const { searchParams } = new URL(request.url);
    const memoId = searchParams.get("memoId");

    if (!memoId) {
      return Response.json({ error: "메모 ID가 필수입니다" }, { status: 400 });
    }

    const memo = await getMemoById(memoId);
    checkAuthor(memo, userId);

    const { error: updateError } = await supabase
      .from("project_memos")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("memo_id", memoId);

    if (updateError) throw updateError;

    return Response.json(
      { message: "메모가 삭제되었습니다", memo_id: memoId },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error, "메모 삭제에 실패했습니다");
  }
}

/**
 * PATCH /api/projectMemos
 * 메모 고정/해제, 이모지 반응 토글, 색상 레이블 변경
 */
export async function PATCH(request: Request) {
  try {
    const userId = await getAuthUserId();
    const { searchParams } = new URL(request.url);
    const memoId = searchParams.get("memoId");
    const body = await request.json();

    if (!memoId) {
      return Response.json({ error: "메모 ID가 필수입니다" }, { status: 400 });
    }

    // 이모지 반응 토글
    if (body.emoji !== undefined) {
      const { data: memo, error: fetchError } = await supabase
        .from("project_memos")
        .select("reactions")
        .eq("memo_id", memoId)
        .single();

      if (fetchError || !memo) {
        return Response.json({ error: "메모를 찾을 수 없습니다" }, { status: 404 });
      }

      const reactions: Record<string, string[]> = memo.reactions || {};
      const emoji: string = body.emoji;
      const users = reactions[emoji] || [];

      if (users.includes(userId)) {
        reactions[emoji] = users.filter((id) => id !== userId);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...users, userId];
      }

      const { data, error } = await supabase
        .from("project_memos")
        .update({ reactions })
        .eq("memo_id", memoId)
        .select()
        .single();

      if (error) throw error;
      return Response.json(data, { status: 200 });
    }

    // 색상 레이블 변경 (작성자만)
    if ("label_color" in body) {
      const memo = await getMemoById(memoId);
      checkAuthor(memo, userId);

      const { data, error } = await supabase
        .from("project_memos")
        .update({ label_color: body.label_color ?? null })
        .eq("memo_id", memoId)
        .select()
        .single();

      if (error) throw error;
      return Response.json(data, { status: 200 });
    }

    // 고정/해제
    if (typeof body.is_pinned === "boolean") {
      const { data, error } = await supabase
        .from("project_memos")
        .update({
          is_pinned: body.is_pinned,
          pinned_at: body.is_pinned ? new Date().toISOString() : null,
        })
        .eq("memo_id", memoId)
        .select()
        .single();

      if (error) throw error;
      return Response.json(data, { status: 200 });
    }

    return Response.json({ error: "변경할 필드가 없습니다" }, { status: 400 });
  } catch (error) {
    return errorResponse(error, "메모 업데이트에 실패했습니다");
  }
}
