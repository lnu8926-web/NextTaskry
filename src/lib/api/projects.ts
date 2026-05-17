import { handleError } from "@/lib/utils/apiError";
import { mockProjects } from "@/app/data/mockProjects";
import { mockProjectMembers } from "@/app/data/mockProjectMembers";

const ITEMS_PER_PAGE = 12;

interface ResultProps {
  message: string;
  params: object;
  data?: any[];
  totalCount?: number;
  timestamp: Date;
}

interface ProjectProps {
  projectId?: string;
  projectName: string;
  type: string;
  status: string;
  startedAt: Date | undefined;
  endedAt: Date | undefined;
  techStack: string;
  description: string;
}

interface ProjectMemberProps {
  projectId: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
}

const PROJECT_BASE_URL = "/api/projects";
const PROJECT_MEMBER_BASE_URL = "/api/projectMembers";

// Project Info API
export async function getProject(page: number = 0): Promise<ResultProps> {
  try {
    const url = `${PROJECT_BASE_URL}?page=${page}`;
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (err) {
    console.warn("getProject API 실패, 목데이터 사용:", err);
    const start = Math.max(0, (page - 1) * ITEMS_PER_PAGE);
    const sliced = mockProjects.slice(start, start + ITEMS_PER_PAGE).map((p) => ({
      ...p,
      project_members: [
        { count: mockProjectMembers.filter((m) => m.project_id === p.project_id).length },
      ],
    }));
    return { message: "mock", params: {}, data: sliced, totalCount: mockProjects.length, timestamp: new Date() };
  }
}

export async function getProjectById(id: string): Promise<ResultProps> {
  try {
    const url = `${PROJECT_BASE_URL}?id=${id}`;
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (err) {
    handleError("getProjectById", err);
  }
}

export async function getProjectByIds(ids: string, page:number = 0): Promise<ResultProps> {
  try {
    const url = `${PROJECT_BASE_URL}?ids=${ids}&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (err) {
    console.warn("getProjectByIds API 실패, 목데이터 사용:", err);
    const idList = ids.split(",");
    const filtered = mockProjects
      .filter((p) => idList.includes(p.project_id))
      .map((p) => ({
        ...p,
        project_members: [
          { count: mockProjectMembers.filter((m) => m.project_id === p.project_id).length },
        ],
      }));
    return { message: "mock", params: {}, data: filtered, totalCount: filtered.length, timestamp: new Date() };
  }
}


export async function createProject(
  projectData: ProjectProps
): Promise<ResultProps> {
  try {
    const url = `${PROJECT_BASE_URL}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });
    const data = await res.json();

    return data;
  } catch (err) {
    handleError("createProject", err);
  }
}

export async function updateProject(
  id: string,
  projectData: ProjectProps
): Promise<ResultProps> {
  try {
    const url = `${PROJECT_BASE_URL}?id=${id}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });
    const data = await res.json();

    return data;
  } catch (err) {
    handleError("updateProject", err);
  }
}

export async function deleteProject(id: string): Promise<ResultProps> {
  try {
    const url = `${PROJECT_BASE_URL}?id=${id}`;
    const res = await fetch(url, {
      method: "DELETE",
    });
    const data = await res.json();

    return data;
  } catch (err) {
    handleError("deleteProject", err);
  }
}

// Project Member API
export async function getProjectMember(id?: string): Promise<ResultProps> {
  try {
    const url = `${PROJECT_MEMBER_BASE_URL}?id=${id}`;
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (err) {
    handleError("getProjectMember", err);
  }
}
export async function getProjectMemberByRole(id?: string, role?:string): Promise<ResultProps> {
  try {
    const url = `${PROJECT_MEMBER_BASE_URL}?id=${id}&role=${role}`;
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (err) {
    handleError("getProjectMemberByRole", err);
  }
}
export async function getProjectMemberByUser(id?: string): Promise<ResultProps> {
  try {
    const url = `${PROJECT_MEMBER_BASE_URL}?userId=${id}`;
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (err) {
    console.warn("getProjectMemberByUser API 실패, 목데이터 사용:", err);
    const filtered = mockProjectMembers.filter((m) => m.user_id === id);
    return { message: "mock", params: {}, data: filtered, totalCount: filtered.length, timestamp: new Date() };
  }
}

export async function updateProjectMember(id?: string, projectMemberData?: ProjectMemberProps[]): Promise<ResultProps> {
  try {
    const url = `${PROJECT_MEMBER_BASE_URL}?id=${id}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectMemberData),
    });
    const data = await res.json();

    return data;
  } catch (err) {
    handleError("updateProjectMember", err);
  }
}

export async function deleteProjectMember(id: string): Promise<ResultProps> {
  try {
    const url = `${PROJECT_MEMBER_BASE_URL}?id=${id}`;
    const res = await fetch(url, {
      method: "DELETE",
    });
    const data = await res.json();

    return data;
  } catch (err) {
    handleError("deleteProjectMember", err);
  }
}
