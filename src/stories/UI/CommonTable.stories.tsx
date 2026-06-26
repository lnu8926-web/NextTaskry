import type { Meta, StoryObj } from "@storybook/react";
import CommonTable, { TableColumn } from "@/components/ui/CommonTable";
import Badge from "@/components/ui/Badge";
import { UserAvatar } from "@/components/shared/UserAvatar";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "member" | "viewer";
  joinedAt: string;
  avatar_url?: string;
}

interface TaskRow {
  id: string;
  title: string;
  status: "todo" | "inprogress" | "done";
  priority: "high" | "medium" | "low";
  assignee: string;
  dueDate: string;
}

const MEMBERS: Member[] = [
  { id: "1", name: "김민준", email: "minjun@example.com", role: "owner", joinedAt: "2026-01-15", avatar_url: undefined },
  { id: "2", name: "이서연", email: "seoyeon@example.com", role: "member", joinedAt: "2026-02-03" },
  { id: "3", name: "박지호", email: "jiho@example.com", role: "member", joinedAt: "2026-03-10" },
  { id: "4", name: "최예진", email: "yejin@example.com", role: "viewer", joinedAt: "2026-04-20" },
  { id: "5", name: "정수현", email: "suhyeon@example.com", role: "member", joinedAt: "2026-05-05" },
];

const TASKS: TaskRow[] = [
  { id: "t1", title: "로그인 페이지 UI 구현", status: "done", priority: "high", assignee: "김민준", dueDate: "2026-06-10" },
  { id: "t2", title: "API 연동 테스트 작성", status: "inprogress", priority: "high", assignee: "이서연", dueDate: "2026-06-20" },
  { id: "t3", title: "다크모드 컬러 토큰 정의", status: "inprogress", priority: "medium", assignee: "박지호", dueDate: "2026-06-25" },
  { id: "t4", title: "Storybook 컴포넌트 추가", status: "todo", priority: "medium", assignee: "최예진", dueDate: "2026-07-01" },
  { id: "t5", title: "모바일 반응형 QA", status: "todo", priority: "low", assignee: "정수현", dueDate: "2026-07-15" },
];

const ROLE_LABEL: Record<Member["role"], string> = {
  owner: "오너",
  member: "멤버",
  viewer: "뷰어",
};

const MEMBER_COLUMNS: TableColumn<Member>[] = [
  {
    label: "멤버",
    accessor: (row) => (
      <div className="flex items-center gap-2.5">
        <UserAvatar userName={row.name} profileImage={row.avatar_url} size={28} />
        <div>
          <p className="text-sm font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    label: "역할",
    accessor: (row) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        row.role === "owner"
          ? "bg-main-100 text-main-700"
          : row.role === "member"
          ? "bg-muted text-foreground"
          : "bg-muted text-muted-foreground"
      }`}>
        {ROLE_LABEL[row.role]}
      </span>
    ),
    align: "center",
    className: "w-24",
  },
  {
    label: "참여일",
    accessor: (row) =>
      new Date(row.joinedAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    align: "right",
    hideOnMobile: true,
    className: "w-32",
  },
];

const TASK_COLUMNS: TableColumn<TaskRow>[] = [
  {
    label: "작업명",
    accessor: (row) => (
      <span className="text-sm font-medium text-foreground">{row.title}</span>
    ),
  },
  {
    label: "상태",
    accessor: (row) => (
      <Badge type={row.status === "inprogress" ? "inProgress" : row.status} />
    ),
    align: "center",
    className: "w-28",
  },
  {
    label: "우선순위",
    accessor: (row) => <Badge type={row.priority} />,
    align: "center",
    className: "w-28",
    hideOnMobile: true,
  },
  {
    label: "담당자",
    accessor: "assignee",
    className: "w-28 text-sm",
    hideOnMobile: true,
  },
  {
    label: "마감일",
    accessor: "dueDate",
    align: "right",
    className: "w-28 text-sm text-muted-foreground",
  },
];

const meta: Meta = {
  title: "UI/CommonTable",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

export const MemberTable: Story = {
  name: "멤버 테이블",
  render: () => (
    <div className="rounded-xl border border-border overflow-hidden">
      <CommonTable
        data={MEMBERS}
        columns={MEMBER_COLUMNS}
        getRowKey={(row) => row.id}
        onRowClick={(row) => alert(`${row.name} 클릭`)}
        showHeaderOnMobile
      />
    </div>
  ),
};

export const TaskTable: Story = {
  name: "작업 테이블",
  render: () => (
    <div className="rounded-xl border border-border overflow-hidden">
      <CommonTable
        data={TASKS}
        columns={TASK_COLUMNS}
        getRowKey={(row) => row.id}
        onRowClick={(row) => alert(`"${row.title}" 클릭`)}
        showHeaderOnMobile
        getRowClassName={(row) =>
          row.status === "done" ? "opacity-60" : ""
        }
      />
    </div>
  ),
};

export const EmptyTable: Story = {
  name: "빈 테이블",
  render: () => (
    <div className="rounded-xl border border-border overflow-hidden">
      <CommonTable
        data={[]}
        columns={MEMBER_COLUMNS}
        getRowKey={(row) => (row as Member).id}
        emptyMessage="멤버가 없습니다. 초대해보세요."
        showHeaderOnMobile
      />
    </div>
  ),
};

export const NoHeaderMobile: Story = {
  name: "모바일 헤더 숨김",
  render: () => (
    <div className="max-w-sm rounded-xl border border-border overflow-hidden">
      <CommonTable
        data={MEMBERS.slice(0, 3)}
        columns={MEMBER_COLUMNS}
        getRowKey={(row) => row.id}
        showHeaderOnMobile={false}
      />
    </div>
  ),
};
