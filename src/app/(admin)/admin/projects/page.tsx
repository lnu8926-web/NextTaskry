import Badge from "@/components/ui/Badge";
import AdminPageWrapper from "@/components/features/admin/AdminPageWrapper";
import { primaryBgColor, primaryBorderColor } from "@/lib/constants/colors";
import { Icon } from "@/components/shared/Icon";
import { supabaseAdmin } from "@/lib/supabase/server";

type ProjectRow = {
  project_id: string;
  project_name: string;
  type: string | null;
  status: string;
  tech_stack: string | null;
  project_members: { role: string; users: { user_name: string }[] }[];
  tasks: { status: string }[];
};

const STATUS_BADGE: Record<string, "dueSoon" | "inProgress" | "done"> = {
  active: "inProgress",
  completed: "done",
  archived: "dueSoon",
};

async function fetchProjects(): Promise<ProjectRow[]> {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select(`
      project_id,
      project_name,
      type,
      status,
      tech_stack,
      project_members ( role, users ( user_name ) ),
      tasks ( status )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin projects fetch error:", error);
    return [];
  }
  return (data ?? []) as unknown as ProjectRow[];
}

export default async function AdminProjectsPage() {
  const projects = await fetchProjects();

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
      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground py-10 text-center">
          프로젝트가 없습니다.
        </p>
      )}

      {projects.map((project) => {
        const leader = project.project_members.find((m) => m.role === "leader");
        const leaderName = leader?.users?.[0]?.user_name ?? "-";
        const memberCount = project.project_members.length;
        const taskTotal = project.tasks.length;
        const taskDone = project.tasks.filter((t) => t.status === "done").length;
        const progress = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0;
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
