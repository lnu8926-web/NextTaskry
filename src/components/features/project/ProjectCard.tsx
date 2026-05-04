import Button from "@/components/ui/Button";
import { Icon } from "@/components/shared/Icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/features/project/Card";
import { DeleteDialog } from "./DeleteDialog";
import { deleteProject, deleteProjectMember } from "@/lib/api/projects";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  projectMember: Record<string, number> | null;
}

export default function ProjectCard({
  project,
  projectMember,
}: ProjectCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSelectProject = (projectId: string) => {
    // 세션 스토리지에 선택한 프로젝트 ID 저장
    sessionStorage.setItem("current_Project_Id", projectId);
    // URL에 ID 노출없이 프로젝트 페이지로 이동
    router.push("/project/workspace");
  };

  const handleEditProject = (projectId: string) => {
    // 세션 스토리지에 선택한 프로젝트 ID 저장
    sessionStorage.setItem("current_Project_Id", projectId);

    // URL에 ID 노출없이 프로젝트 페이지로 이동
    router.push("/project/update/");
  };

  async function handleDeleteProject(id: string) {
    // 프로젝트 및 프로젝트 멤버 정보 삭제
    await deleteProject(id);
    await deleteProjectMember(id);

    // 캐시 무효화 → 목록 자동 재조회
    queryClient.invalidateQueries({ queryKey: ["projects"] });

    showToast("삭제되었습니다.", "deleted");
  }

  return (
    <>
      <Card
        onClick={() => {
          handleSelectProject(project.project_id);
        }}
      >
        <div>
          <CardHeader className="flex w-full mb-2">
            <CardTitle>{project.project_name}</CardTitle>
          </CardHeader>
          <CardDescription className="flex">
            <div className="flex gap-2 text-sm text-dark-description">
              {project.description}
            </div>
          </CardDescription>
        </div>
        <CardContent className="flex justify-end">
          <div className="flex gap-2 font-medium text-main-400 dark:text-main-200 ">
            <Icon
              type="users"
              size={18}
              className="text-main-400 dark:text-main-200 "
            />
            <div className="text-sm">
              {projectMember ? projectMember[project.project_id] : 1}팀원
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <div onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
            <Button
              btnType="icon"
              icon="edit"
              size={16}
              variant="primary"
              onClick={() => handleEditProject(project.project_id)}
            />
          </div>
          <div onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
            <DeleteDialog
              onClick={() => handleDeleteProject(project.project_id)}
            />
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
