"use client";

import { Icon } from "@/components/shared/Icon";
import { DeleteDialog } from "./DeleteDialog";
import { deleteProject, deleteProjectMember } from "../model";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/queryKeys";
import type { Project, ProjectStatus } from "../model";
import { CalendarDays, Pencil } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  projectMember: Record<string, number> | null;
}

const TYPE_LABEL: Record<string, string> = {
  "팀 프로젝트": "팀 프로젝트",
  "개인 프로젝트": "개인 프로젝트",
  "학습 프로젝트": "학습 프로젝트",
  "상용 프로젝트": "상용 프로젝트",
};

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  active: {
    label: "진행중",
    className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  completed: {
    label: "완료",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  },
  archived: {
    label: "일시정지",
    className: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\. /g, ".").replace(/\.$/, "");
}

export default function ProjectCard({ project, projectMember }: ProjectCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const memberCount = projectMember ? (projectMember[project.project_id] ?? 1) : 1;
  const statusConfig = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.active;
  const typeLabel = TYPE_LABEL[project.type] ?? project.type;

  async function handleDeleteProject() {
    await deleteProject(project.project_id);
    await deleteProjectMember(project.project_id);
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    showToast("삭제되었습니다.", "deleted");
  }

  return (
    <div
      onClick={() => router.push(`/project/workspace/${project.project_id}`)}
      className="flex flex-col bg-card rounded-2xl border border-border cursor-pointer transition-all duration-200 hover:border-main-300 hover:shadow-md dark:hover:border-main-600 p-5"
    >
      {/* 상단 — 타입 뱃지 + 이름 + 설명 */}
      <div className="flex-1 min-h-0">
        <span className="inline-block px-2 py-0.5 bg-main-500/10 dark:bg-main-400/10 text-main-600 dark:text-main-300 text-xs font-medium rounded-full mb-2">
          {typeLabel}
        </span>
        <h3 className="font-semibold text-base text-foreground mb-1 line-clamp-1">
          {project.project_name}
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 line-clamp-2 min-h-10">
          {project.description || "설명 없음"}
        </p>
      </div>

      {/* 날짜 */}
      <div className="flex items-center gap-1.5 mt-4 text-xs text-main-600 dark:text-main-300">
        <CalendarDays className="w-3.5 h-3.5 shrink-0" />
        <span>
          {formatDate(project.started_at)} ~ {formatDate(project.ended_at)}
        </span>
      </div>

      {/* 푸터 — 팀원 수 + 상태 뱃지 + 버튼 */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm font-medium text-main-500 dark:text-main-400">
            <Icon type="users" size={16} className="text-main-500 dark:text-main-400" />
            <span>{memberCount}팀원</span>
          </div>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/project/update/${project.project_id}`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-main-500/10 hover:border-main-300 text-muted-foreground hover:text-main-500 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <DeleteDialog onClick={handleDeleteProject} />
        </div>
      </div>
    </div>
  );
}
