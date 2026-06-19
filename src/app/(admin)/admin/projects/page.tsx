import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AdminPageWrapper from "@/components/features/admin/AdminPageWrapper";
import { primaryBgColor, primaryBorderColor } from "@/lib/constants/colors";
import { Icon } from "@/components/shared/Icon";
import { mockProjects } from "@/app/data/mockProjects";
import { mockProjectMembers } from "@/app/data/mockProjectMembers";
import { mockTasks } from "@/app/data/mockTasks";

function getProgress(projectId: string): number {
  const tasks = mockTasks.filter((t) => t.project_id === projectId);
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}

function getLeaderName(projectId: string): string {
  const leader = mockProjectMembers.find(
    (m) => m.project_id === projectId && m.role === "leader"
  );
  return leader?.users.user_name ?? "-";
}

function getMemberCount(projectId: string): number {
  return mockProjectMembers.filter((m) => m.project_id === projectId).length;
}

const STATUS_BADGE: Record<string, "dueSoon" | "inProgress" | "done"> = {
  active: "inProgress",
  completed: "done",
  archived: "dueSoon",
};

export default function AdminProjectsPage() {
  return (
    <AdminPageWrapper
      title="프로젝트 관리"
      titleIcon="folder"
      action={
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="프로젝트 검색"
            className="h-12 text-sm font-normal w-2xs border px-3 rounded-md"
          />
          <div className="h-12 flex items-center gap-1 rounded-md border border-gray-100 px-3 cursor-pointer">
            <Icon type="filter" size={18} />
            <span className="inline-block">필터</span>
          </div>
        </div>
      }
    >
      {mockProjects.map((project) => {
        const progress = getProgress(project.project_id);
        const leaderName = getLeaderName(project.project_id);
        const memberCount = getMemberCount(project.project_id);
        const badgeType = STATUS_BADGE[project.status] ?? "dueSoon";

        return (
          <div
            key={project.project_id}
            className={`border ${primaryBorderColor.Color2[0]} py-7 px-5 rounded-xl mb-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {project.project_name} <Badge type={badgeType} />
                </h3>
                <ul className="flex gap-5 mt-3">
                  <li className="font-normal text-sm">리더: {leaderName}</li>
                  <li className="font-normal text-sm">멤버: {memberCount}명</li>
                  {project.tech_stack && (
                    <li className="font-normal text-sm text-muted-foreground">
                      {project.tech_stack}
                    </li>
                  )}
                </ul>
              </div>
              <Button btnType="icon" icon="trash" size={16} variant="basic" />
            </div>
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className={`w-100% ${primaryBgColor.Color2[0]} rounded-full h-2.5 overflow-hidden mt-5`}
            >
              <div
                className={`${primaryBgColor.color1[1]} h-2.5 transition-all duration-500 rounded-full`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">
              태스크 완료율 {progress}%
            </p>
          </div>
        );
      })}
    </AdminPageWrapper>
  );
}
