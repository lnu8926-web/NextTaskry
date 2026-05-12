"use client";

import { Icon } from "@/components/shared/Icon";
import { DeleteDialog } from "./DeleteDialog";
import { deleteProject, deleteProjectMember } from "../model";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/queryKeys";
import type { Project, ProjectStatus } from "../model";
import { Pencil } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  projectMember: Record<string, number> | null;
}

const STATUS_DOT: Record<ProjectStatus, string> = {
  active:    "bg-main-500",
  completed: "bg-gray-300 dark:bg-gray-500",
  archived:  "bg-amber-400",
};

function formatDeadline(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\. /g, ".").replace(/\.$/, "") + " 마감";
}

export default function ProjectCard({ project, projectMember }: ProjectCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const memberCount = projectMember?.[project.project_id] ?? 1;
  const dot = STATUS_DOT[project.status] ?? STATUS_DOT.active;
  const deadline = formatDeadline(project.ended_at);

  async function handleDelete() {
    await deleteProject(project.project_id);
    await deleteProjectMember(project.project_id);
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    showToast("삭제되었습니다.", "deleted");
  }

  return (
    <div
      onClick={() => router.push(`/project/workspace/${project.project_id}`)}
      className="group relative flex flex-col bg-white dark:bg-card rounded-[14px] border border-[#bde3ec] dark:border-border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      {/* 타입 라벨 */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
        {project.type || "기타"}
      </div>

      {/* 제목 + 설명 */}
      <div className="flex-1 min-h-0 mb-5">
        <h3 className="font-semibold text-[18px] text-foreground line-clamp-1 mb-2">
          {project.project_name}
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
          {project.description || "설명이 없습니다."}
        </p>
      </div>

      {/* 마감일 + 멤버 수 + 호버 액션 */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {deadline ?? "마감일 없음"}
        </span>

        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icon type="users" size={12} />
            {memberCount}명
          </span>
          <div
            className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
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
    </div>
  );
}
