"use client";

import { X } from "lucide-react";
import { Calendar22 } from "./Calendar";
import { StatusSelect } from "./StatusSelect";
import { TypeSelect } from "./TypeSelect";
import { Input } from "@/components/ui/shadcn/Input";
import { Label } from "@/components/ui/shadcn/Label";
import { Textarea } from "@/components/ui/shadcn/Textarea";
import {
  createProject,
  getProjectById,
  getProjectMember,
  updateProject,
  updateProjectMember,
} from "../model";
import { showToast } from "@/lib/utils/toast";
import { getUser, getUserById } from "@/lib/api/users";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/queryKeys";
import { ComboBox, type Item, getAvatarColor } from "./ComboBox";
import ProjectDateCard from "./ProjectDateCard";
import { RoleSelect } from "./RoleSelect";
import { cn } from "@/lib/utils/utils";

interface ProjectProps {
  projectName: string;
  type: string;
  status: string;
  startedAt: Date | undefined;
  endedAt: Date | undefined;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  techStack: string;
  description: string;
}

interface ProjectFormProps {
  projectId?: string;
}

export default function ProjectForm({ projectId = "" }: ProjectFormProps) {
  const router = useRouter();
  const [projectData, setProjectData] = useState<ProjectProps>({
    projectName: "",
    type: "",
    status: "",
    startedAt: new Date(),
    endedAt: new Date(),
    createdAt: undefined,
    updatedAt: undefined,
    techStack: "",
    description: "",
  });
  const [user, setUser] = useState<Item | null>(null);
  const queryClient = useQueryClient();

  interface ProjectMemberItem {
    projectId: string;
    userId: string;
    userName: string;
    email: string;
    role: string;
  }
  const [projectMember, setProjectMember] = useState<ProjectMemberItem[]>([]);

  // 유저 목록 조회
  const { data: userList = [] } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const result = await getUser();
      return (result.data || []).map(({ user_id, user_name, email }) => ({
        id: user_id,
        label: `${user_name} (${email})`,
        value: user_name,
        email,
      })) as Item[];
    },
    staleTime: 1000 * 60 * 10,
  });

  // 프로젝트 정보 + 멤버 조회 (수정 모드)
  useQuery({
    queryKey: queryKeys.projectForm.detail(projectId),
    queryFn: async () => {
      if (!projectId) return null;

      const [projectResult, memberResult] = await Promise.all([
        getProjectById(projectId),
        getProjectMember(projectId),
      ]);

      const project = projectResult.data?.[0];
      if (project) {
        setProjectData({
          projectName: project.project_name ?? "",
          type: project.type ?? "",
          status: project.status ?? "",
          techStack: project.tech_stack ?? "",
          description: project.description ?? "",
          startedAt: project.started_at,
          endedAt: project.ended_at,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
        });
      }

      if (memberResult.data) {
        const memberPromises = memberResult.data.map(async (member) => {
          const { data } = await getUserById("eq", member.user_id);
          const userInfo = data?.[0];
          if (!userInfo) return null;
          return {
            projectId,
            userId: userInfo.user_id,
            userName: userInfo.user_name,
            email: userInfo.email,
            role: member.role,
          };
        });
        const validMembers = (await Promise.all(memberPromises)).filter(
          (m): m is ProjectMemberItem => m !== null
        );
        setProjectMember(validMembers);
      }

      return null;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });

  // 일반 Input과 Textarea를 위한 handleChange
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProjectData((prevProjectData) => ({
      ...prevProjectData,
      [name]: value,
    }));
  };

  // Select 컴포넌트를 위한 handleChange
  const handleSelectChange = (name: string, value: string) => {
    setProjectData((prevProjectData) => ({
      ...prevProjectData,
      [name]: value,
    }));
  };

  // RoleSelect 컴포넌트를 위한 handleChange
  const handleRoleSelectChange = (index: number, value: string) => {
    const newProjectMembers = [...projectMember];

    newProjectMembers[index] = {
      ...newProjectMembers[index],
      role: value,
    };

    setProjectMember(newProjectMembers);
  };

  // Calendar를 위한 핸들러
  const handleDateChange = (name: string, date: Date | undefined) => {
    if (!date) {
      setProjectData((prevProjectData) => ({
        ...prevProjectData,
        [name]: undefined,
      }));
      return;
    }

    const adjustedDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    setProjectData((prevProjectData) => ({
      ...prevProjectData,
      [name]: adjustedDate,
    }));
  };

  // 프로젝트 멤버 추가 핸들러
  const handleAddProjectMember = (newItem: Item | null) => {
    if (!newItem) {
      return;
    }
    const isDuplicate = projectMember.some(
      (member) => member.userId === newItem.id
    );

    if (isDuplicate) {
      alert("이미 추가된 멤버입니다.");
      return;
    }

    const newMember = {
      projectId: projectId,
      userId: newItem.id,
      userName: newItem.value,
      email: newItem.email,
      role: "member",
    };
    setProjectMember((prev) => [...prev, newMember]);
  };

  // 프로젝트 멤버 삭제 핸들러
  const handleDeleteProjectMember = (id: string) => {
    const filterProjectMember = projectMember.filter(
      (member) => member.userId !== id
    );
    setProjectMember(filterProjectMember);
  };

  const handleSubmit = () => {
    if (!projectData.projectName.trim()) {
      showToast("프로젝트 명을 입력해주세요.", "error");
      return;
    }
    if (!projectData.type) {
      showToast("프로젝트 분류를 선택해주세요.", "error");
      return;
    }
    if (!projectData.status) {
      showToast("프로젝트 상태를 선택해주세요.", "error");
      return;
    }
    submitProject();
  };

  const { mutate: submitProject, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      let targetId = projectId;

      if (!targetId) {
        const { data } = await createProject(projectData);
        targetId = data?.[0]?.project_id;
      } else {
        await updateProject(targetId, projectData);
      }

      if (targetId) {
        await updateProjectMember(targetId, projectMember);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      showToast("저장되었습니다.", "success");
      router.push("/");
    },
    onError: (error) => {
      console.error(error);
      showToast("저장에 실패했습니다.", "error");
    },
  });

  return (
    <div className="w-full">
      {/* 페이지 타이틀 */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">
          {projectId ? "프로젝트 수정" : "새 프로젝트"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {projectId ? "프로젝트 정보를 수정합니다." : "팀과 함께할 새 프로젝트를 만들어보세요."}
        </p>
      </div>

      {/* Card */}
      <div className="w-full bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

        {/* Card Body — 2-column grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

          {/* 프로젝트 명 — full width */}
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">프로젝트 명</Label>
            <Input
              id="projectName"
              name="projectName"
              type="text"
              placeholder="프로젝트 명을 입력해주세요"
              value={projectData.projectName}
              onChange={handleChange}
            />
          </div>

          {/* 분류 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">분류</Label>
            <TypeSelect
              value={projectData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
            />
          </div>

          {/* 상태 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">상태</Label>
            <StatusSelect
              value={projectData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            />
          </div>

          {/* 시작일 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">시작일</Label>
            <Calendar22
              value={projectData.startedAt}
              onValueChange={(value) => handleDateChange("startedAt", value)}
            />
          </div>

          {/* 종료일 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">종료일</Label>
            <Calendar22
              value={projectData.endedAt}
              onValueChange={(value) => handleDateChange("endedAt", value)}
            />
          </div>

          {/* 날짜 카드 — full width, 수정 모드에서만 */}
          {projectId && (
            <div className="md:col-span-2">
              <ProjectDateCard projectData={projectData} />
            </div>
          )}

          {/* 기술 스택 — full width */}
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">기술 스택</Label>
            <Input
              id="techStack"
              name="techStack"
              type="text"
              placeholder="예) React, TypeScript, Supabase"
              value={projectData.techStack}
              onChange={handleChange}
            />
          </div>

          {/* 설명 — full width */}
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">설명</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="프로젝트 목표와 주요 내용을 입력해주세요. (최대 300자)"
              value={projectData.description}
              onChange={handleChange}
            />
          </div>

          {/* 구성원 — full width */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">구성원</Label>
              {projectMember.length > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-muted-foreground">
                  {projectMember.length}
                </span>
              )}
            </div>

            <ComboBox
              items={userList}
              value={user}
              setValue={setUser}
              onChange={handleAddProjectMember}
            />

            {projectMember.length > 0 && (
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                {projectMember.map((member, index) => {
                  const initial = member.userName?.charAt(0)?.toUpperCase() ?? "?"
                  const avatarColor = getAvatarColor(member.userName)
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-neutral-50 dark:bg-card dark:hover:bg-muted/30 transition-colors duration-100"
                    >
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", avatarColor)}>
                        {initial}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-foreground leading-snug">{member.userName}</span>
                        <span className="text-xs text-muted-foreground truncate">{member.email}</span>
                      </div>
                      <RoleSelect
                        value={member.role}
                        onValueChange={(value) => handleRoleSelectChange(index, value)}
                      />
                      <button
                        type="button"
                        aria-label={`${member.userName} 제거`}
                        onClick={() => handleDeleteProjectMember(member.userId)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>{/* /Card Body */}

        {/* Card Footer */}
        <div className="border-t border-border bg-neutral-50/60 dark:bg-muted/10 px-6 py-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-border hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold text-white bg-main-500 hover:bg-main-600 dark:bg-main-600 dark:hover:bg-main-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                저장 중...
              </>
            ) : projectId ? "수정 완료" : "프로젝트 생성"}
          </button>
        </div>{/* /Card Footer */}

      </div>{/* /Card */}
    </div>
  );
}
