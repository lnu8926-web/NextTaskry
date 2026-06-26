import { Project } from "@/types";

export const mockProject: Project = {
  project_id: "project-1",
  project_name: "Taskry 프로젝트 관리",
  description: "팀 협업을 위한 프로젝트 관리 플랫폼입니다.",
  type: "웹 개발",
  status: "active",
  started_at: "2026-01-01",
  ended_at: "2026-12-31",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
};

export const mockProjectCompleted: Project = {
  project_id: "project-2",
  project_name: "모바일 앱 개발",
  description: "React Native 기반 크로스플랫폼 모바일 앱 프로젝트",
  type: "모바일",
  status: "completed",
  started_at: "2026-03-01",
  ended_at: "2026-05-31",
  created_at: "2026-03-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
};

export const mockProjectArchived: Project = {
  project_id: "project-3",
  project_name: "레거시 마이그레이션",
  description: "구버전 시스템에서 최신 아키텍처로 마이그레이션",
  type: "인프라",
  status: "archived",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-12-01T00:00:00Z",
};

export const mockProjects: Project[] = [
  mockProject,
  {
    project_id: "project-4",
    project_name: "디자인 시스템 구축",
    description: "Figma 기반 디자인 시스템과 Storybook 문서화",
    type: "UI/UX",
    status: "active",
    started_at: "2026-04-01",
    ended_at: "2026-09-30",
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
  },
  mockProjectCompleted,
  {
    project_id: "project-5",
    project_name: "API 서버 구축",
    description: "REST API 서버 및 데이터베이스 설계",
    type: "백엔드",
    status: "active",
    started_at: "2026-05-01",
    ended_at: "2026-08-31",
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
  },
  mockProjectArchived,
  {
    project_id: "project-6",
    project_name: "사용자 리서치",
    description: "UX 리서치 및 사용성 테스트 보고서",
    type: "리서치",
    status: "completed",
    started_at: "2026-02-01",
    ended_at: "2026-04-30",
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
  },
];

export const mockProjectLongText: Project = {
  project_id: "project-long",
  project_name: "글로벌 이커머스 플랫폼 풀스택 리뉴얼 프로젝트",
  description:
    "기존 레거시 이커머스 시스템을 Next.js 14 App Router 기반으로 전면 재구축하고 Supabase 실시간 데이터베이스와 연동하여 사용자 경험을 전반적으로 개선하는 대규모 프로젝트입니다.",
  type: "풀스택 웹 개발 및 클라우드 인프라",
  status: "active",
  started_at: "2026-01-01",
  ended_at: "2026-12-31",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
};

export const mockProjectMemberCounts: Record<string, number> = {
  "project-1": 4,
  "project-2": 6,
  "project-3": 1,
  "project-4": 3,
  "project-5": 2,
  "project-6": 5,
};
