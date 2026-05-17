import { NoticeResponse } from "@/types/notice";
import { Notice } from "@/types/notice";
import { NOTICE_CONSTANS, NOTICE_MESSAGES } from "../constants/notices";
import { mockNotices } from "@/app/data/mockNotices";

export const ITEM_PER_PAGE = NOTICE_CONSTANS.ITEMS_PER_PAGE;

// ------------------------------------------------------
// API 에러 처리 헬퍼 함수
// ------------------------------------------------------

async function handleApiResponse<T>(response: Response): Promise<T> {
  const errorData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const serverMessage =
      typeof errorData?.error === "string" ? errorData.error : null;

    const fallbackMessageByStatus: Record<number, string> = {
      400: "잘못된 요청입니다.",
      401: "로그인이 필요합니다.",
      403: "권한이 없습니다.",
      404: "요청한 데이터를 찾을 수 없습니다.",
      500: "서버 오류가 발생했습니다.",
    };

    const fallback =
      fallbackMessageByStatus[response.status] ||
      `API 요청 실패: ${response.status}`;

    throw new Error(serverMessage || fallback);
  }

  return errorData as T;
}
// ------------------------------------------------------
// 공지사항 목록 조회
// ------------------------------------------------------

export async function getNotices(
  page: number = 1,
  limit: number = ITEM_PER_PAGE
): Promise<NoticeResponse> {
  try {
    const response = await fetch(
      `/api/announcements?page=${page}&limit=${limit}`
    );
    const result = await handleApiResponse<{
      data: Notice[];
      totalCount: number;
    }>(response);

    return {
      data: result.data || [],
      totalCount: result.totalCount || 0,
    };
  } catch (error) {
    console.warn("공지사항 API 실패, 목데이터 사용:", error);
    const start = (page - 1) * limit;
    return {
      data: mockNotices.slice(start, start + limit),
      totalCount: mockNotices.length,
    };
  }
}

// ------------------------------------------------------
// 공지사항 작성 (관리자만 가능)
// ------------------------------------------------------

export async function createNotice(data: {
  title: string;
  is_important: boolean;
  content: string;
}): Promise<Notice> {
  // 클라이언트 측 유효성 검사
  if (!data.title.trim()) {
    throw new Error(NOTICE_MESSAGES.TITLE_REQUIRED);
  }
  if (data.title.length > NOTICE_CONSTANS.TITLE_MAX_LENGTH) {
    throw new Error(NOTICE_MESSAGES.TITLE_TOO_LONG);
  }
  if (!data.content.trim()) {
    throw new Error(NOTICE_MESSAGES.CONTENT_REQUIRED);
  }

  try {
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.title.trim(),
        content: data.content.trim(),
        is_important: data.is_important,
      }),
    });

    const result = await handleApiResponse<{ data: Notice }>(response);
    return result.data;
  } catch (error) {
    console.error("공지사항 작성 오류:", error);
    throw error;
  }
}

// ------------------------------------------------------
// 공지사항 상세 조회
// ------------------------------------------------------

export async function getNoticeById(
  id: string | number
): Promise<Notice | null> {
  try {
    const response = await fetch(`/api/announcements?announcement_id=${id}`);

    if (response.status === 404) {
      return null;
    }

    const result = await handleApiResponse<{ data: Notice }>(response);
    return result.data || null;
  } catch (error) {
    console.warn("공지사항 상세 API 실패, 목데이터 사용:", error);
    return mockNotices.find((n) => n.announcement_id === String(id)) ?? null;
  }
}

// ------------------------------------------------------
// 공지사항 수정 (관리자만 가능)
// ------------------------------------------------------

export async function updateNotice(
  id: string | number,
  data: {
    title?: string;
    content?: string;
    is_important?: boolean;
  }
): Promise<Notice> {
  if (data.title !== undefined) {
    if (!data.title.trim()) {
      throw new Error(NOTICE_MESSAGES.TITLE_REQUIRED);
    }
    if (data.title.length > 255) {
      throw new Error(NOTICE_MESSAGES.TITLE_TOO_LONG);
    }
  }

  try {
    const response = await fetch(`/api/announcements?announcement_id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await handleApiResponse<{ data: Notice }>(response);
    return result.data;
  } catch (error) {
    console.error("공지사항 수정 오류:", error);
    throw error;
  }
}

// ------------------------------------------------------
// 공지사항 삭제 (관리자만 가능)
// ------------------------------------------------------

export async function deleteNotice(id: string | number): Promise<void> {
  try {
    const response = await fetch(`/api/announcements?announcement_id=${id}`, {
      method: "DELETE",
    });

    await handleApiResponse<{ message: string }>(response);
  } catch (error) {
    console.error("공지사항 삭제 오류:", error);
    throw error;
  }
}
