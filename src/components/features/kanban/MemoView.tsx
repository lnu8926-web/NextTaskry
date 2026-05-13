"use client";

/**
 * MemoView 컴포넌트
 *
 * 프로젝트별 메모를 관리하는 컴포넌트
 * 주요 기능:
 * - 메모 작성, 조회, 삭제, 고정/해제
 * - 실시간 메모 동기화 (Supabase Realtime)
 * - 검색 및 필터링 (전체/내메모/고정됨)
 * - 무한 스크롤 페이지네이션
 * - 키보드 단축키 지원 (Ctrl+Enter)
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ProjectMemo, MemoLabelColor } from "@/types/projectMemo";
import { supabase } from "@/lib/supabase/supabase";
import { useSession } from "next-auth/react";
import { Icon } from "@/components/shared/Icon";
import { useModal } from "@/hooks/useModal";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ThumbsUp, ThumbsDown, Heart, Flame, Eye } from "lucide-react";

// 메모 최대 길이 제한
const MEMO_MAX_LENGTH = 5000;

// 필터 타입: 전체, 내 메모, 고정된 메모
type FilterType = "all" | "mine" | "pinned";

// 메모지 색상 팔레트 (Google Keep 스타일)
const MEMO_COLORS: { value: MemoLabelColor; card: string; dot: string }[] = [
  { value: "red",    card: "bg-red-50 dark:bg-red-900/30",       dot: "bg-red-400" },
  { value: "orange", card: "bg-orange-50 dark:bg-orange-900/30", dot: "bg-orange-400" },
  { value: "yellow", card: "bg-yellow-50 dark:bg-yellow-900/30", dot: "bg-yellow-400" },
  { value: "green",  card: "bg-green-50 dark:bg-green-900/30",   dot: "bg-green-400" },
  { value: "blue",   card: "bg-blue-50 dark:bg-blue-900/30",     dot: "bg-blue-400" },
  { value: "purple", card: "bg-purple-50 dark:bg-purple-900/30", dot: "bg-purple-400" },
];

const REACTION_SET = [
  { key: "thumbsUp",   Icon: ThumbsUp,    label: "동의" },
  { key: "thumbsDown", Icon: ThumbsDown,  label: "재고 필요" },
  { key: "heart",      Icon: Heart,       label: "마음에 들어" },
  { key: "flame",      Icon: Flame,       label: "중요" },
  { key: "eye",        Icon: Eye,         label: "보고 있어" },
] as const;

// 정렬 타입: 최신순, 오래된순
type SortType = "newest" | "oldest";

interface MemoFormProps {
  projectId: string;
}

const MemoView = ({ projectId }: MemoFormProps) => {
  // === 기본 상태 관리 ===
  const [memos, setMemos] = useState<ProjectMemo[]>([]); // 서버에서 받은 원본 메모 목록
  const [newMemo, setNewMemo] = useState(""); // 새 메모 입력 내용
  const [loadingMemos, setLoadingMemos] = useState(false); // 메모 추가/수정/삭제 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const [isLoading, setIsLoading] = useState(true); // 초기 데이터 로딩 상태

  // === UI 상태 관리 ===
  const [showFilter, setShowFilter] = useState(false); // 필터 영역 표시/숨김
  const [searchTerm, setSearchTerm] = useState(""); // 검색어

  // === 필터링 & 정렬 상태 ===
  const [filter, setFilter] = useState<FilterType>("all"); // 메모 필터 (전체/내메모/고정됨)
  const [sort, setSort] = useState<SortType>("newest"); // 정렬 방식 (최신순/오래된순)

  // === 페이지네이션 상태 ===
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [hasMore, setHasMore] = useState(false); // 더 로드할 메모가 있는지

  const ITEMS_PER_PAGE = 10; // 페이지당 메모 개수

  const { data: session } = useSession();
  const memoMaxLength = MEMO_MAX_LENGTH;
  const { openModal, closeModal, modalProps } = useModal();
  const [deletingMemoId, setDeletingMemoId] = useState<string | null>(null);

  // === 색상 피커 / 이모지 상태 ===
  const [colorPickerMemoId, setColorPickerMemoId] = useState<string | null>(null);
  const [emojiPickerMemoId, setEmojiPickerMemoId] = useState<string | null>(null);

  // === 인라인 편집 상태 ===
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * 필터링된 메모 계산
   *
   * 클라이언트 사이드에서 실시간으로 필터링 수행
   * 1. 검색어 필터링 (메모 내용, 작성자명, 이메일)
   * 2. 작성자 필터링 (전체, 내 메모, 고정된 메모)
   * 3. 정렬 (최신순, 오래된순)
   */
  const filteredMemos = useMemo(() => {
    let result = [...memos];

    // 1️⃣ 검색어로 메모 내용, 작성자명, 이메일 필터링
    if (searchTerm.trim()) {
      result = result.filter(
        (memo) =>
          memo.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          memo.author?.user_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          memo.author?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. 작성자 필터
    if (filter === "mine" && session?.user?.user_id) {
      result = result.filter((memo) => memo.user_id === session.user.user_id);
    } else if (filter === "pinned") {
      result = result.filter((memo) => memo.is_pinned);
    }

    // 3. 정렬
    result.sort((a, b) => {
      // 1. 고정된 메모가 항상 위로
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      // 2. 사용자 설정에 따른 정렬
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      // 3. 정렬 방식 적용
      if (sort === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    return result;
  }, [memos, filter, sort, searchTerm, session?.user?.user_id]);

  /**
   * 메모 목록 조회 함수
   *
   * @param page - 페이지 번호 (기본값: 1)
   * @param append - 기존 목록에 추가할지 여부 (무한스크롤용)
   */
  const fetchMemos = useCallback(
    async (page = 1, append = false) => {
      try {
        if (page === 1) setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          projectId,
          userId: filter === "mine" ? session?.user?.user_id || "" : "",
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          sortBy: sort === "newest" ? "newest" : "oldest",
          search: searchTerm,
          pinned_only: filter === "pinned" ? "true" : "false",
        });

        const res = await fetch(`/api/projectMemos?${params}`);
        if (!res.ok) throw new Error("메모 조회 실패");

        const data = await res.json();
        const newMemos = data.data || [];

        if (append) {
          setMemos((prev) => [...prev, ...newMemos]);
        } else {
          setMemos(newMemos);
        }

        setHasMore(data.hasMore || false);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err.message : "메모 조회 실패");
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, filter, session?.user?.user_id, sort, searchTerm]
  );

  // 초기 로드
  useEffect(() => {
    if (projectId) {
      fetchMemos();
    }
  }, [projectId, fetchMemos]);

  // 필터링 및 검색어 변경 시 재조회
  useEffect(() => {
    if (projectId) {
      setCurrentPage(1);
      fetchMemos(1);
    }
  }, [searchTerm, filter, sort, projectId, fetchMemos]);

  /**
   * Supabase Realtime 구독 설정
   *
   * 다른 사용자의 메모 추가/수정/삭제를 실시간으로 동기화
   * - INSERT: 새 메모가 추가되면 목록에 추가하고 재정렬
   * - UPDATE: 메모 수정 시 목록 업데이트, soft delete 처리
   * - DELETE: 메모 삭제 시 목록에서 제거
   */
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-memos-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_memos",
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newMemo = payload.new as ProjectMemo;
            // 내가 추가한 건 이미 로컬 state에 있으므로 중복 방지
            setMemos((prev) => {
              if (prev.some((m) => m.memo_id === newMemo.memo_id)) return prev;
              // author는 API로 가져와서 채움
              fetchMemos(1);
              return prev;
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedMemo = payload.new as ProjectMemo;
            if (updatedMemo.is_deleted) {
              setMemos((prev) =>
                prev.filter((m) => m.memo_id !== updatedMemo.memo_id)
              );
              return;
            }
            // 기존 author 유지하고 나머지 필드만 갱신
            setMemos((prev) =>
              prev.map((m) =>
                m.memo_id === updatedMemo.memo_id
                  ? { ...m, ...updatedMemo }
                  : m
              )
            );
          } else if (payload.eventType === "DELETE") {
            const deletedMemo = payload.old as ProjectMemo;
            setMemos((prev) =>
              prev.filter((m) => m.memo_id !== deletedMemo.memo_id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchMemos]);

  // 메모 추가
  const handleAddMemo = async () => {
    if (!newMemo.trim()) {
      setError("메모를 입력하세요");
      return;
    }

    if (newMemo.length > memoMaxLength) {
      setError(`메모는 ${memoMaxLength}자 이내여야 합니다`);
      return;
    }

    try {
      setLoadingMemos(true);
      setError(null);

      const res = await fetch("/api/projectMemos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          content: newMemo.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "메모 저장 실패");
      }

      const created = await res.json();
      setMemos((prev) => {
        if (prev.some((m) => m.memo_id === created.memo_id)) return prev;
        return sort === "newest" ? [created, ...prev] : [...prev, created];
      });
      setNewMemo("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "메모 저장 실패");
    } finally {
      setLoadingMemos(false);
    }
  };

  // 메모 삭제 확인 모달 열기
  const handleDeleteMemo = (memoId: string) => {
    setDeletingMemoId(memoId);
    openModal("delete", "메모 삭제", "이 메모를 삭제하시겠습니까?");
  };

  // 메모 삭제 실행
  const confirmDeleteMemo = async () => {
    if (!deletingMemoId) return;

    try {
      setError(null);

      const res = await fetch(`/api/projectMemos?memoId=${deletingMemoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "메모 삭제 실패");
      }

      setMemos((prev) => prev.filter((m) => m.memo_id !== deletingMemoId));
      closeModal();
      setTimeout(() => {
        openModal("deleteSuccess");
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "메모 삭제 실패");
    } finally {
      setDeletingMemoId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleAddMemo();
    }
  };

  // 메모 고정/해제
  const handleTogglePin = async (memoId: string, isPinned: boolean) => {
    try {
      setError(null);

      const requestBody = {
        is_pinned: !isPinned, // 서버에서 pinned_at을 자동으로 처리함
      };

      const res = await fetch(`/api/projectMemos?memoId=${memoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "메모 고정 설정 실패");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "메모 고정 설정 실패");
    }
  };

  // 작성자 확인 함수
  const isAuthor = (memoUserId: string) => {
    return session?.user?.user_id === memoUserId;
  };

  // 메모지 색상 변경
  const handleColorChange = async (memoId: string, color: MemoLabelColor) => {
    setColorPickerMemoId(null);
    setMemos((prev) =>
      prev.map((m) => (m.memo_id === memoId ? { ...m, label_color: color } : m))
    );
    await fetch(`/api/projectMemos?memoId=${memoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label_color: color }),
    });
  };

  // 이모지 반응 토글
  const handleReaction = async (memoId: string, emoji: string) => {
    if (!session?.user?.user_id) return;
    const userId = session.user.user_id;
    setMemos((prev) =>
      prev.map((m) => {
        if (m.memo_id !== memoId) return m;
        const reactions = { ...m.reactions };
        const users = reactions[emoji] ? [...reactions[emoji]] : [];
        if (users.includes(userId)) {
          reactions[emoji] = users.filter((id) => id !== userId);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji] = [...users, userId];
        }
        return { ...m, reactions };
      })
    );
    await fetch(`/api/projectMemos?memoId=${memoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
  };

  // 인라인 편집 시작
  const handleStartEdit = (memo: ProjectMemo) => {
    setEditingMemoId(memo.memo_id);
    setEditContent(memo.content);
    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.focus();
        editTextareaRef.current.style.height = "auto";
        editTextareaRef.current.style.height = editTextareaRef.current.scrollHeight + "px";
      }
    }, 0);
  };

  // 인라인 편집 취소
  const handleCancelEdit = () => {
    setEditingMemoId(null);
    setEditContent("");
  };

  // 인라인 편집 저장
  const handleSaveEdit = async (memoId: string) => {
    if (!editContent.trim()) return;
    try {
      setSavingEdit(true);
      setError(null);
      const res = await fetch(`/api/projectMemos?memoId=${memoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "메모 수정 실패");
      }
      setMemos((prev) =>
        prev.map((m) =>
          m.memo_id === memoId ? { ...m, content: editContent.trim() } : m
        )
      );
      setEditingMemoId(null);
      setEditContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "메모 수정 실패");
    } finally {
      setSavingEdit(false);
    }
  };

  /**
   * 검색어 하이라이트 함수
   *
   * 메모 내용에서 검색어와 일치하는 부분을 노란색으로 강조 표시
   * @param text - 하이라이트할 텍스트
   * @returns JSX 요소 배열 (하이라이트된 부분 포함)
   */
  const highlightSearchTerm = (text: string) => {
    if (!searchTerm.trim()) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-600/50 text-gray-900 dark:text-gray-100 rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  /**
   * 무한 스크롤 - 더 많은 메모 로드
   *
   * 현재 로딩 중이 아니고 더 로드할 데이터가 있을 때만 실행
   * append=true로 기존 목록에 새 메모들을 추가
   */
  const loadMoreMemos = () => {
    if (!isLoading && hasMore) {
      fetchMemos(currentPage + 1, true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-border overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-main-200 dark:bg-main-600 shadow-sm">
        <h2 className="text-sm font-bold text-white dark:text-gray-100">
          메모
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/90 dark:text-gray-200">
            {filteredMemos.length}개
          </span>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
            title={showFilter ? "필터 닫기" : "필터 열기"}
          >
            <Icon
              type="filter"
              size={14}
              className={`text-white transition-transform duration-300 ${
                showFilter ? "scale-110" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* 필터 영역 */}
      {showFilter && (
        <div className="m-2 p-2.5 border border-border bg-muted/40 dark:bg-muted/20 rounded-lg space-y-2.5">
          {/* 작성자 & 고정 필터 */}
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase">
              표시
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  filter === "all"
                    ? "bg-main-500 text-white"
                    : "bg-muted text-muted-foreground border border-border hover:border-main-400"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilter("mine")}
                className={`flex-1 px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  filter === "mine"
                    ? "bg-main-500 text-white"
                    : "bg-muted text-muted-foreground border border-border hover:border-main-400"
                }`}
              >
                내 메모
              </button>
              <button
                onClick={() => setFilter("pinned")}
                className={`flex-1 px-2 py-1 text-[11px] font-medium rounded transition-colors flex items-center justify-center gap-0.5 ${
                  filter === "pinned"
                    ? "bg-main-500 text-white"
                    : "bg-muted text-muted-foreground border border-border hover:border-main-400"
                }`}
              >
                <Icon type="pin" size={9} />
                고정
              </button>
            </div>
          </div>

          {/* 검색 */}
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase">
              검색
            </span>
            <div className="relative">
              <Icon
                type="search"
                size={12}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="메모, 작성자..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-6 pr-6 py-1 text-[11px] bg-input border border-border rounded text-foreground placeholder:text-muted-foreground input-focus-style"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Icon type="x" size={10} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* 정렬 */}
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase">
              정렬
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setSort("newest")}
                className={`flex-1 px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  sort === "newest"
                    ? "bg-main-500 text-white"
                    : "bg-muted text-muted-foreground border border-border hover:border-main-400"
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => setSort("oldest")}
                className={`flex-1 px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  sort === "oldest"
                    ? "bg-main-500 text-white"
                    : "bg-muted text-muted-foreground border border-border hover:border-main-400"
                }`}
              >
                오래된순
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mx-2 sm:mx-4 mb-2 px-3 sm:px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* 메모 입력 폼 */}
      <div className="m-2 p-2.5 border-b border-border">
        <div className="relative">
          <textarea
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MEMO_MAX_LENGTH}
            placeholder="메모를 입력하세요..."
            disabled={loadingMemos}
            rows={3}
            className="w-full pt-(--fluid-textarea-p) pb-(--fluid-textarea-p) pl-(--fluid-textarea-p) pr-8 sm:pr-10 border border-border bg-input rounded-xl resize-none text-sm input-focus-style transition-all placeholder:text-muted-foreground text-foreground disabled:opacity-50"
          />
          {newMemo && (
            <button
              onClick={() => setNewMemo("")}
              className="absolute right-2 top-2 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="메모 내용 지우기"
            >
              <svg
                className="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {newMemo.length} / {MEMO_MAX_LENGTH}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] border border-gray-300 dark:border-gray-600 font-mono">
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] border border-gray-300 dark:border-gray-600 font-mono">
                ↵
              </kbd>
            </span>
          </div>
          <Button
            onClick={handleAddMemo}
            disabled={loadingMemos || !newMemo.trim()}
            btnType="form"
            icon="plus"
            size={16}
            className="w-full sm:w-auto"
          >
            {loadingMemos ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              "추가"
            )}
          </Button>
        </div>
      </div>

      {/* 메모 목록 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main-400"></div>
          </div>
        ) : filteredMemos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-amber-400 dark:text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {searchTerm
                ? `"${searchTerm}"에 대한 검색 결과가 없습니다`
                : filter === "mine"
                ? "작성한 메모가 없습니다"
                : filter === "pinned"
                ? "고정된 메모가 없습니다"
                : "첫 번째 메모를 작성해보세요!"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-3 px-4 py-2 text-xs font-medium text-main-600 dark:text-main-400 bg-main-50 dark:bg-main-900/30 hover:bg-main-100 dark:hover:bg-main-900/50 rounded-lg transition-colors"
              >
                검색어 지우기
              </button>
            )}
          </div>
        ) : (
          <>
            {filteredMemos.map((memo) => {
              const colorStyle = MEMO_COLORS.find((c) => c.value === memo.label_color);
              const cardClass = colorStyle
                ? `${colorStyle.card} border border-border`
                : memo.is_pinned
                ? "bg-main-50 dark:bg-main-900/30 border-2 border-main-200 dark:border-main-700/50"
                : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50";

              return (
              <div
                key={memo.memo_id}
                className={`group relative rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${cardClass}`}
              >
                {/* 상단: 날짜 + 버튼들 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/* 고정 버튼 */}
                    <button
                      onClick={() =>
                        handleTogglePin(memo.memo_id, memo.is_pinned)
                      }
                      className={`p-2 rounded-lg transition-all ${
                        memo.is_pinned
                          ? "text-main-500 dark:text-main-400 bg-main-50 dark:bg-main-900/30"
                          : "text-gray-400 dark:text-gray-500 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      title={memo.is_pinned ? "고정 해제" : "고정"}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        style={{
                          transform: memo.is_pinned
                            ? "rotate(45deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                      </svg>
                    </button>

                    {/* 날짜 */}
                    <span className="text-xs text-gray-400 dark:text-gray-400 font-medium">
                      {(() => {
                   
                        return new Date(memo.created_at).toLocaleString("ko-KR", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                      })()}
                    </span>
                  </div>

                  {/* 편집/색상/삭제 버튼 */}
                  {isAuthor(memo.user_id) && editingMemoId !== memo.memo_id && (
                    <div className="flex items-center gap-1">
                      {/* 색상 피커 */}
                      <div className="relative">
                        <button
                          onClick={() => setColorPickerMemoId(colorPickerMemoId === memo.memo_id ? null : memo.memo_id)}
                          className="p-2 rounded-lg text-gray-400 dark:text-gray-500 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                          title="메모 색상"
                        >
                          <div className={`w-3.5 h-3.5 rounded-full border-2 border-gray-300 dark:border-gray-500 ${colorStyle ? colorStyle.dot : "bg-white dark:bg-gray-700"}`} />
                        </button>
                        {colorPickerMemoId === memo.memo_id && (
                          <div className="absolute right-0 top-8 z-30 bg-card border border-border rounded-xl shadow-lg p-2 flex gap-1.5">
                            {MEMO_COLORS.map((c) => (
                              <button
                                key={c.value}
                                onClick={() => handleColorChange(memo.memo_id, c.value)}
                                className={`w-5 h-5 rounded-full ${c.dot} hover:scale-125 transition-transform ${memo.label_color === c.value ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}
                              />
                            ))}
                            <button
                              onClick={() => handleColorChange(memo.memo_id, null)}
                              className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 hover:scale-125 transition-transform flex items-center justify-center text-[10px] text-gray-500"
                              title="색상 없음"
                            >✕</button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleStartEdit(memo)}
                        className="p-2 rounded-lg text-gray-400 dark:text-gray-500 sm:opacity-0 sm:group-hover:opacity-100 hover:text-main-500 dark:hover:text-main-400 hover:bg-main-50 dark:hover:bg-main-900/20 transition-all"
                        title="편집"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteMemo(memo.memo_id)}
                        className="p-2 rounded-lg text-gray-400 dark:text-gray-500 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* 내용: 편집 모드 */}
                {editingMemoId === memo.memo_id ? (
                  <div className="mb-3">
                    <textarea
                      ref={editTextareaRef}
                      value={editContent}
                      onChange={(e) => {
                        setEditContent(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === "Enter") handleSaveEdit(memo.memo_id);
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      maxLength={MEMO_MAX_LENGTH}
                      disabled={savingEdit}
                      rows={3}
                      className="w-full p-2 text-sm border border-main-300 dark:border-main-600 bg-input rounded-lg resize-none overflow-hidden text-foreground focus:outline-none focus:ring-2 focus:ring-main-400 dark:focus:ring-main-500 disabled:opacity-50"
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-gray-400">{editContent.length} / {MEMO_MAX_LENGTH} · Ctrl+Enter 저장 · Esc 취소</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={handleCancelEdit}
                          disabled={savingEdit}
                          className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleSaveEdit(memo.memo_id)}
                          disabled={savingEdit || !editContent.trim()}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-main-500 hover:bg-main-600 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {savingEdit ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> : null}
                          저장
                        </button>
                      </div>
                    </div>
                  </div>
                ) : searchTerm ? (
                  /* 검색 중: 하이라이트 plain text */
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-3">
                    {highlightSearchTerm(memo.content)}
                  </p>
                ) : (
                  /* 일반 모드: 마크다운 렌더링 */
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-3 text-gray-800 dark:text-gray-200 leading-relaxed prose-p:my-1 prose-headings:my-1.5 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-code:text-xs prose-code:bg-gray-100 prose-code:dark:bg-gray-700 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:dark:bg-gray-800 prose-pre:p-2 prose-pre:rounded-lg prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:dark:border-gray-600 prose-blockquote:pl-3 prose-blockquote:text-gray-600 prose-blockquote:dark:text-gray-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {memo.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* 아이콘 반응 */}
                <div className="flex items-center gap-1 flex-wrap mb-2 min-h-6">
                  {/* 기존 반응 */}
                  {REACTION_SET.map(({ key, Icon: ReactionIcon, label }) => {
                    const users = memo.reactions?.[key] ?? [];
                    if (users.length === 0) return null;
                    const active = users.includes(session?.user?.user_id || "");
                    return (
                      <button
                        key={key}
                        onClick={() => handleReaction(memo.memo_id, key)}
                        title={label}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                          active
                            ? "bg-main-500 dark:bg-main-400 border-main-500 dark:border-main-400 text-white"
                            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50 text-gray-500 dark:text-gray-400 hover:border-main-300"
                        }`}
                      >
                        <ReactionIcon className="w-3 h-3" />
                        <span className="font-medium">{users.length}</span>
                      </button>
                    );
                  })}
                  {/* 반응 추가 버튼 */}
                  <div className="relative">
                    <button
                      onClick={() => setEmojiPickerMemoId(emojiPickerMemoId === memo.memo_id ? null : memo.memo_id)}
                      className="flex items-center justify-center w-6 h-6 rounded-full text-xs text-gray-400 dark:text-gray-500 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 transition-all"
                      title="반응 추가"
                    >+</button>
                    {emojiPickerMemoId === memo.memo_id && (
                      <div className="absolute left-0 bottom-8 z-30 bg-card border border-border rounded-xl shadow-lg px-2 py-1.5 flex gap-1">
                        {REACTION_SET.map(({ key, Icon: ReactionIcon, label }) => (
                          <button
                            key={key}
                            onClick={() => { handleReaction(memo.memo_id, key); setEmojiPickerMemoId(null); }}
                            title={label}
                            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:scale-125 hover:bg-muted/40 transition-all"
                          >
                            <ReactionIcon className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 작성자 */}
                <div className="flex justify-end">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/80 dark:bg-gray-800/80 supports-backdrop-filter:bg-white/60 supports-backdrop-filter:dark:bg-gray-800/60 supports-backdrop-filter:backdrop-blur-sm rounded-md text-xs text-gray-600 dark:text-gray-400">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {memo.author?.user_name ||
                      memo.author?.email ||
                      "알 수 없음"}
                  </span>
                </div>
              </div>
              );
            })}

            {/* 더보기 버튼 */}
            {hasMore && (
              <div className="flex justify-center pt-4 pb-2">
                <button
                  onClick={loadMoreMemos}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-main-600 dark:text-main-400 bg-main-50 dark:bg-main-900/30 hover:bg-main-100 dark:hover:bg-main-900/50 border border-main-200 dark:border-main-700/50 rounded-xl transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-main-500 border-t-transparent"></div>
                      로딩 중...
                    </>
                  ) : (
                    <>
                      <Icon type="chevronDown" size={16} />
                      더보기
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <Modal {...modalProps} onConfirm={confirmDeleteMemo} />
    </div>
  );
};

export default MemoView;
