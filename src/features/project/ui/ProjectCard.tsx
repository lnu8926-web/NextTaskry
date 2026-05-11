"use client";

import { Icon } from "@/components/shared/Icon";
import { DeleteDialog } from "./DeleteDialog";
import { deleteProject, deleteProjectMember } from "../model";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/queryKeys";
import type { Project, ProjectStatus } from "../model";
import { Pencil, CalendarDays } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  projectMember: Record<string, number> | null;
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; dot: string; text: string }> = {
  active:    { label: "진행중",   dot: "bg-emerald-400",              text: "text-emerald-600 dark:text-emerald-400" },
  completed: { label: "완료",     dot: "bg-gray-300 dark:bg-gray-500", text: "text-gray-400 dark:text-gray-500"       },
  archived:  { label: "일시정지", dot: "bg-amber-400",                text: "text-amber-500 dark:text-amber-400"     },
};

function formatDate(d: string) {
  const date = new Date(d);
  const dateStr = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeStr = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateStr.replace(/\. /g, ".").replace(/\.$/, "")} ${timeStr}`;
}

function formatDateRange(start?: string, end?: string) {
  if (!start && !end) return null;
  if (!end) return formatDate(start!);
  return `${formatDate(start!)} – ${formatDate(end)}`;
}

export default function ProjectCard({ project, projectMember }: ProjectCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const memberCount = projectMember?.[project.project_id] ?? 1;
  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.active;
  const dateRange = formatDateRange(project.started_at, project.ended_at);

  async function handleDelete() {
    await deleteProject(project.project_id);
    await deleteProjectMember(project.project_id);
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    showToast("삭제되었습니다.", "deleted");
  }

  return (
    <div
      onClick={() => router.push(`/project/workspace/${project.project_id}`)}
      className="group relative flex flex-col bg-card rounded-2xl border border-border p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-main-200 dark:hover:border-main-700"
    >
      {/* 상태 */}
      <div className={`flex items-center gap-1.5 text-xs font-medium mb-3 ${status.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
        {status.label}
      </div>

      {/* 제목 + 설명 */}
      <div className="flex-1 min-h-0 mb-4">
        <h3 className="font-semibold text-base text-foreground line-clamp-1 mb-1.5">
          {project.project_name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {project.description || "설명이 없습니다."}
        </p>
      </div>

      {/* 날짜 */}
      {dateRange && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <CalendarDays className="w-3.5 h-3.5 shrink-0 text-main-400 dark:text-main-300" />
          <span>{dateRange}</span>
        </div>
      )}

      {/* 팀원 수 + 호버 액션 */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <Icon type="users" size={12} />
          {memberCount}명
        </span>

        {/* 호버 시 나타나는 액션 버튼 */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => router.push(`/project/update/${project.project_id}`)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-main-500 hover:bg-main-500/10 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <div className="[&>button]:w-7 [&>button]:h-7 [&>button]:rounded-lg">
            <DeleteDialog onClick={handleDelete} />
          </div>
        </div>
      </div>
    </div>
  );
}
