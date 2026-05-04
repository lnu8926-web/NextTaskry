"use client";

import {
  getProject,
  getProjectByIds,
  getProjectMemberByUser,
} from "@/lib/api/projects";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/queryKeys";
import { useSession } from "next-auth/react";
import { useProjectBoard } from "@/providers/ProjectBoardProvider";
import Container from "@/components/shared/Container";
import ProjectBoardEmpty from "./ProjectBoardEmpty";
import ProjectCard from "./ProjectCard";
import CommonPagination from "@/components/ui/CommonPagination";
import { ProjectCardSkeleton } from "@/components/ui/ProjectCardSkeleton";
import type { Project } from "@/types/project";

export default function ProjectBoard() {
  const { data: session, status } = useSession();
  const { filter } = useProjectBoard();

  const userId = session?.user?.user_id;

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const { data: queryResult, isLoading } = useQuery({
    queryKey: queryKeys.projects.list(filter.view, currentPage, userId),
    queryFn: async () => {
      if (!userId) return null;

      let projectResult = null;

      if (filter.view === "personal") {
        const { data: memberData } = await getProjectMemberByUser(userId);

        if (!memberData || memberData.length === 0) {
          return { projectList: [] as Project[], projectMember: {} as Record<string, number>, totalPage: 0 };
        }

        const currentIds = memberData.map((m) => m.project_id).join(",");
        projectResult = await getProjectByIds(currentIds, currentPage);
      } else {
        projectResult = await getProject(currentPage);
      }

      const { data, totalCount } = projectResult;
      const totalPage = totalCount ? Math.ceil(totalCount / ITEMS_PER_PAGE) : 1;

      const projectMember = (data || []).reduce<Record<string, number>>((acc, project) => {
        acc[project.project_id] = project.project_members?.[0]?.count || 0;
        return acc;
      }, {});

      return {
        projectList: (data || []) as Project[],
        projectMember,
        totalPage,
      };
    },
    enabled: status === "authenticated" && !!userId,
    staleTime: 1000 * 60 * 3,
  });

  const projectList = queryResult?.projectList ?? [];
  const projectMember = queryResult?.projectMember ?? {};
  const totalPage = queryResult?.totalPage ?? 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter.view]);

  const sortedProjectList = useMemo(() => {
    if (projectList.length === 0) return [];

    const dateFieldMap = {
      createdAt: "created_at",
      startedAt: "started_at",
      updatedAt: "updated_at",
      endedAt: "ended_at",
    };

    const filterKey = filter.date as keyof typeof dateFieldMap;
    const targetKey = dateFieldMap[filterKey] || "created_at";
    const isAsc = filter.sort === "asc";

    // 원본(projectList)을 건드리지 않고 복사하여 정렬
    return [...projectList].sort((a, b) => {
      const timeA = new Date(a[targetKey as keyof Project] as string).getTime();
      const timeB = new Date(b[targetKey as keyof Project] as string).getTime();

      return isAsc ? timeA - timeB : timeB - timeA;
    });
  }, [projectList, filter.date, filter.sort]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-400px)]">
        <span className="text-lg text-gray-500">
          프로젝트를 불러오는 중입니다...
        </span>
      </div>
      // <div className="pb-10">
      //   <div className="h-[calc(100vh-400px)] overflow-y-auto">
      //     <div
      //         className="
      //           grid
      //           grid-cols-1
      //           sm:grid-cols-1
      //           md:grid-cols-2
      //           lg:grid-cols-3
      //           gap-4"
      //       >
      //         {Array.from({length: 12}).map((_, index) => {
      //           return (
      //             <ProjectCardSkeleton key={index} />
      //           );
      //         })}
      //       </div>
      //     </div>
      //   </div>
    );
  }

  if (sortedProjectList.length === 0) {
    return (
      <Container className="pt-0">
        <ProjectBoardEmpty />
      </Container>
    );
  }

  return (
    <div className="pb-10">
      <div className="h-[calc(100vh-400px)] overflow-y-auto">
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-4"
        >
          {sortedProjectList.map((project, index) => {
            return (
              <ProjectCard
                key={index}
                project={project}
                projectMember={projectMember}
              />
            );
          })}
        </div>
      </div>
      <div>
        <CommonPagination
          currentPage={currentPage}
          totalPages={totalPage}
          onPageChange={handlePageChange}
          buttonStyle="arrow"
        />
      </div>
    </div>
  );
}
