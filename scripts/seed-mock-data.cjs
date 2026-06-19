/**
 * seed-mock-data.cjs
 * 프로젝트 목 데이터를 Supabase에 시딩하는 스크립트
 *
 * 사용법:
 *   node scripts/seed-mock-data.cjs
 *   node scripts/seed-mock-data.cjs --reset  (기존 데이터 삭제 후 재삽입)
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// ─── .env.local 로드 ────────────────────────────────────────
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

// ─── UUID 상수 ───────────────────────────────────────────────
// 사용자 (mockUsers.ts에서 가져온 실제 UUID)
const USERS = {
  "user-001": {
    user_id: "542f30a4-f316-41c4-a7e9-723b3a29ddf6",
    email: "lnu8926@gmail.com",
    user_name: "이남은",
    profile_image: "https://avatars.githubusercontent.com/u/60370886",
    global_role: "admin",
    auth_provider: "github",
    is_active: true,
    created_at: "2026-01-01T09:00:00Z",
    updated_at: "2026-01-01T09:00:00Z",
  },
  "user-002": {
    user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0003",
    email: "minjung.kim@taskry.dev",
    user_name: "김민중",
    profile_image: "https://avatars.githubusercontent.com/u/10000002",
    global_role: "user",
    auth_provider: "google",
    is_active: true,
    created_at: "2026-01-05T09:00:00Z",
    updated_at: "2026-01-05T09:00:00Z",
  },
  "user-003": {
    user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001",
    email: "wonchan.lee@taskry.dev",
    user_name: "이원찬",
    profile_image: "https://avatars.githubusercontent.com/u/10000003",
    global_role: "user",
    auth_provider: "github",
    is_active: true,
    created_at: "2026-01-03T09:00:00Z",
    updated_at: "2026-01-03T09:00:00Z",
  },
  "user-004": {
    user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0002",
    email: "hyunsu.lee@taskry.dev",
    user_name: "이현수",
    profile_image: "https://avatars.githubusercontent.com/u/10000004",
    global_role: "user",
    auth_provider: "google",
    is_active: true,
    created_at: "2026-01-04T09:00:00Z",
    updated_at: "2026-01-04T09:00:00Z",
  },
};

// user-001~004 이외의 추가 사용자
const EXTRA_USERS = [
  {
    user_id: "2e2fea2d-3034-4e38-9c81-84c4b3b918b7",
    email: "muni22kim@gmail.com",
    user_name: "LUNA Lee",
    profile_image: "https://avatars.githubusercontent.com/u/10000000",
    global_role: "user",
    auth_provider: "google",
    is_active: true,
    created_at: "2026-01-02T09:00:00Z",
    updated_at: "2026-01-02T09:00:00Z",
  },
  {
    user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0004",
    email: "jieun.park@taskry.dev",
    user_name: "박지은",
    profile_image: "https://avatars.githubusercontent.com/u/10000005",
    global_role: "user",
    auth_provider: "github",
    is_active: false,
    created_at: "2026-01-06T09:00:00Z",
    updated_at: "2026-03-01T09:00:00Z",
  },
  {
    user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0005",
    email: "seoyeon.choi@taskry.dev",
    user_name: "최서연",
    profile_image: "https://avatars.githubusercontent.com/u/10000006",
    global_role: "user",
    auth_provider: "google",
    is_active: true,
    created_at: "2026-02-01T09:00:00Z",
    updated_at: "2026-02-01T09:00:00Z",
  },
  {
    user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0006",
    email: "junhyuk.park@taskry.dev",
    user_name: "박준혁",
    profile_image: "https://avatars.githubusercontent.com/u/10000007",
    global_role: "user",
    auth_provider: "github",
    is_active: true,
    created_at: "2026-02-10T09:00:00Z",
    updated_at: "2026-02-10T09:00:00Z",
  },
];

// 프로젝트 UUID
const PROJECT_IDS = {
  "project-001": "10101010-1010-1010-1010-101010100001",
  "project-002": "10101010-1010-1010-1010-101010100002",
  "project-003": "10101010-1010-1010-1010-101010100003",
};

// 칸반 보드 UUID
const BOARD_IDS = {
  "board-001": "20202020-2020-2020-2020-202020200001",
  "board-002": "20202020-2020-2020-2020-202020200002",
  "board-003": "20202020-2020-2020-2020-202020200003",
};

// 태스크 UUID
const TASK_IDS = {
  "task-001": "30303030-3030-3030-3030-303030300001",
  "task-002": "30303030-3030-3030-3030-303030300002",
  "task-003": "30303030-3030-3030-3030-303030300003",
  "task-004": "30303030-3030-3030-3030-303030300004",
  "task-005": "30303030-3030-3030-3030-303030300005",
  "task-006": "30303030-3030-3030-3030-303030300006",
  "task-007": "30303030-3030-3030-3030-303030300007",
  "task-008": "30303030-3030-3030-3030-303030300008",
  "task-009": "30303030-3030-3030-3030-303030300009",
};

// 메모 UUID
const MEMO_IDS = {
  "memo-001": "50505050-5050-5050-5050-505050500001",
  "memo-002": "50505050-5050-5050-5050-505050500002",
  "memo-003": "50505050-5050-5050-5050-505050500003",
  "memo-004": "50505050-5050-5050-5050-505050500004",
  "memo-005": "50505050-5050-5050-5050-505050500005",
  "memo-006": "50505050-5050-5050-5050-505050500006",
  "memo-007": "50505050-5050-5050-5050-505050500007",
  "memo-008": "50505050-5050-5050-5050-505050500008",
};

// 공지사항 UUID
const NOTICE_IDS = {
  "notice-001": "60606060-6060-6060-6060-606060600001",
  "notice-002": "60606060-6060-6060-6060-606060600002",
  "notice-003": "60606060-6060-6060-6060-606060600003",
  "notice-004": "60606060-6060-6060-6060-606060600004",
  "notice-005": "60606060-6060-6060-6060-606060600005",
  "notice-006": "60606060-6060-6060-6060-606060600006",
  "notice-007": "60606060-6060-6060-6060-606060600007",
  "notice-008": "60606060-6060-6060-6060-606060600008",
};

// ─── 헬퍼 ───────────────────────────────────────────────────
function uid(mockId, map) {
  if (!map[mockId]) throw new Error(`Unknown mock ID: ${mockId}`);
  return map[mockId];
}

// ─── 시드 데이터 ─────────────────────────────────────────────

function buildProjects() {
  return [
    {
      project_id: uid("project-001", PROJECT_IDS),
      user_id: USERS["user-001"].user_id,
      project_name: "웹 서비스 리뉴얼",
      description: "메인 서비스 UI/UX 개선 및 성능 최적화",
      type: "웹",
      status: "active",
      tech_stack: "Next.js, TypeScript, Tailwind CSS",
      started_at: "2026-03-01",
      ended_at: "2026-06-30",
      created_at: "2026-02-20T09:00:00Z",
      updated_at: "2026-05-10T09:00:00Z",
    },
    {
      project_id: uid("project-002", PROJECT_IDS),
      user_id: USERS["user-002"].user_id,
      project_name: "모바일 앱 개발",
      description: "iOS/Android 크로스 플랫폼 앱 개발",
      type: "모바일",
      status: "active",
      tech_stack: "React Native, Expo, TypeScript",
      started_at: "2026-04-01",
      ended_at: "2026-08-31",
      created_at: "2026-03-15T09:00:00Z",
      updated_at: "2026-05-12T09:00:00Z",
    },
    {
      project_id: uid("project-003", PROJECT_IDS),
      user_id: USERS["user-003"].user_id,
      project_name: "백엔드 API 개선",
      description: "REST API 성능 개선 및 Swagger 문서화",
      type: "백엔드",
      status: "completed",
      tech_stack: "Node.js, PostgreSQL, Supabase",
      started_at: "2026-01-15",
      ended_at: "2026-04-30",
      created_at: "2026-01-10T09:00:00Z",
      updated_at: "2026-04-30T17:00:00Z",
    },
  ];
}

function buildProjectMembers() {
  return [
    // project-001
    { project_id: uid("project-001", PROJECT_IDS), user_id: USERS["user-001"].user_id, role: "leader", joined_at: "2026-02-20T09:00:00Z" },
    { project_id: uid("project-001", PROJECT_IDS), user_id: USERS["user-002"].user_id, role: "member", joined_at: "2026-02-21T09:00:00Z" },
    { project_id: uid("project-001", PROJECT_IDS), user_id: USERS["user-003"].user_id, role: "member", joined_at: "2026-02-21T10:00:00Z" },
    // project-002
    { project_id: uid("project-002", PROJECT_IDS), user_id: USERS["user-002"].user_id, role: "leader", joined_at: "2026-03-15T09:00:00Z" },
    { project_id: uid("project-002", PROJECT_IDS), user_id: USERS["user-003"].user_id, role: "member", joined_at: "2026-03-16T09:00:00Z" },
    { project_id: uid("project-002", PROJECT_IDS), user_id: USERS["user-004"].user_id, role: "member", joined_at: "2026-03-16T10:00:00Z" },
    // project-003
    { project_id: uid("project-003", PROJECT_IDS), user_id: USERS["user-003"].user_id, role: "leader", joined_at: "2026-01-10T09:00:00Z" },
    { project_id: uid("project-003", PROJECT_IDS), user_id: USERS["user-001"].user_id, role: "member", joined_at: "2026-01-11T09:00:00Z" },
    { project_id: uid("project-003", PROJECT_IDS), user_id: USERS["user-004"].user_id, role: "member", joined_at: "2026-01-11T10:00:00Z" },
  ];
}

function buildKanbanBoards() {
  return [
    {
      id: uid("board-001", BOARD_IDS),
      name: "웹 서비스 리뉴얼 보드",
      description: "웹 서비스 리뉴얼 프로젝트 칸반 보드",
      project_id: uid("project-001", PROJECT_IDS),
      columns: "todo,inprogress,done",
      created_at: "2026-02-20T09:00:00Z",
      updated_at: "2026-05-10T09:00:00Z",
    },
    {
      id: uid("board-002", BOARD_IDS),
      name: "모바일 앱 개발 보드",
      description: "모바일 앱 개발 프로젝트 칸반 보드",
      project_id: uid("project-002", PROJECT_IDS),
      columns: "todo,inprogress,done",
      created_at: "2026-03-15T09:00:00Z",
      updated_at: "2026-05-12T09:00:00Z",
    },
    {
      id: uid("board-003", BOARD_IDS),
      name: "백엔드 API 개선 보드",
      description: "백엔드 API 개선 프로젝트 칸반 보드",
      project_id: uid("project-003", PROJECT_IDS),
      columns: "todo,inprogress,done",
      created_at: "2026-01-10T09:00:00Z",
      updated_at: "2026-04-30T17:00:00Z",
    },
  ];
}

function buildTasks() {
  return [
    // ── project-001 / board-001 ──
    {
      id: uid("task-001", TASK_IDS),
      kanban_board_id: uid("board-001", BOARD_IDS),
      project_id: uid("project-001", PROJECT_IDS),
      title: "메인 페이지 UI 개선",
      description: "메인 페이지 레이아웃 및 반응형 디자인 적용",
      status: "inprogress",
      priority: "high",
      assigned_user_id: USERS["user-001"].user_id,
      subtasks: [
        { id: "task-001-sub-1", title: "와이어프레임 작성", completed: true },
        { id: "task-001-sub-2", title: "컴포넌트 개발", completed: false },
        { id: "task-001-sub-3", title: "반응형 테스트", completed: false },
      ],
      memo: "모바일 우선 디자인 적용",
      started_at: "2026-05-01",
      ended_at: "2026-05-20",
      created_at: "2026-04-28T09:00:00Z",
      updated_at: "2026-05-10T09:00:00Z",
    },
    {
      id: uid("task-002", TASK_IDS),
      kanban_board_id: uid("board-001", BOARD_IDS),
      project_id: uid("project-001", PROJECT_IDS),
      title: "성능 최적화",
      description: "번들 사이즈 축소 및 로딩 속도 개선",
      status: "todo",
      priority: "high",
      assigned_user_id: USERS["user-002"].user_id,
      subtasks: [
        { id: "task-002-sub-1", title: "번들 분석", completed: false },
        { id: "task-002-sub-2", title: "코드 스플리팅 적용", completed: false },
        { id: "task-002-sub-3", title: "이미지 최적화", completed: false },
      ],
      memo: null,
      started_at: null,
      ended_at: "2026-05-28",
      created_at: "2026-04-28T10:00:00Z",
      updated_at: "2026-04-28T10:00:00Z",
    },
    {
      id: uid("task-003", TASK_IDS),
      kanban_board_id: uid("board-001", BOARD_IDS),
      project_id: uid("project-001", PROJECT_IDS),
      title: "사용자 피드백 반영",
      description: "베타 테스트 피드백 검토 및 수정 사항 적용",
      status: "done",
      priority: "normal",
      assigned_user_id: USERS["user-003"].user_id,
      subtasks: [
        { id: "task-003-sub-1", title: "피드백 수집 및 정리", completed: true },
        { id: "task-003-sub-2", title: "우선순위 분류", completed: true },
        { id: "task-003-sub-3", title: "수정 사항 반영", completed: true },
      ],
      memo: "사용자 만족도 크게 상승",
      started_at: "2026-04-10",
      ended_at: "2026-04-25",
      created_at: "2026-04-08T09:00:00Z",
      updated_at: "2026-04-25T17:00:00Z",
    },

    // ── project-002 / board-002 ──
    {
      id: uid("task-004", TASK_IDS),
      kanban_board_id: uid("board-002", BOARD_IDS),
      project_id: uid("project-002", PROJECT_IDS),
      title: "React Native 프로젝트 초기 셋업",
      description: "초기 프로젝트 구조 및 개발 환경 설정",
      status: "done",
      priority: "high",
      assigned_user_id: USERS["user-002"].user_id,
      subtasks: [
        { id: "task-004-sub-1", title: "프로젝트 생성", completed: true },
        { id: "task-004-sub-2", title: "주요 라이브러리 설치", completed: true },
        { id: "task-004-sub-3", title: "폴더 구조 정리", completed: true },
      ],
      memo: null,
      started_at: "2026-04-01",
      ended_at: "2026-04-05",
      created_at: "2026-04-01T09:00:00Z",
      updated_at: "2026-04-05T17:00:00Z",
    },
    {
      id: uid("task-005", TASK_IDS),
      kanban_board_id: uid("board-002", BOARD_IDS),
      project_id: uid("project-002", PROJECT_IDS),
      title: "로그인 화면 개발",
      description: "Google·GitHub 소셜 로그인 및 이메일 로그인 구현",
      status: "inprogress",
      priority: "high",
      assigned_user_id: USERS["user-003"].user_id,
      subtasks: [
        { id: "task-005-sub-1", title: "UI 디자인 완료", completed: true },
        { id: "task-005-sub-2", title: "소셜 로그인 API 연동", completed: false },
        { id: "task-005-sub-3", title: "유효성 검증 로직", completed: false },
      ],
      memo: "Google, GitHub 로그인 모두 지원",
      started_at: "2026-04-08",
      ended_at: "2026-05-16",
      created_at: "2026-04-07T09:00:00Z",
      updated_at: "2026-05-13T10:00:00Z",
    },
    {
      id: uid("task-006", TASK_IDS),
      kanban_board_id: uid("board-002", BOARD_IDS),
      project_id: uid("project-002", PROJECT_IDS),
      title: "푸시 알림 기능",
      description: "FCM을 이용한 푸시 알림 수신 및 처리 구현",
      status: "todo",
      priority: "normal",
      assigned_user_id: USERS["user-004"].user_id,
      subtasks: [],
      memo: null,
      started_at: null,
      ended_at: "2026-06-30",
      created_at: "2026-04-10T09:00:00Z",
      updated_at: "2026-04-10T09:00:00Z",
    },

    // ── project-003 / board-003 ──
    {
      id: uid("task-007", TASK_IDS),
      kanban_board_id: uid("board-003", BOARD_IDS),
      project_id: uid("project-003", PROJECT_IDS),
      title: "Swagger API 문서화",
      description: "Swagger를 이용한 REST API 문서 자동화",
      status: "done",
      priority: "high",
      assigned_user_id: USERS["user-003"].user_id,
      subtasks: [
        { id: "task-007-sub-1", title: "Swagger 설정", completed: true },
        { id: "task-007-sub-2", title: "전체 엔드포인트 문서화", completed: true },
        { id: "task-007-sub-3", title: "요청/응답 예제 추가", completed: true },
      ],
      memo: "개발자 가이드 포함 완료",
      started_at: "2026-02-01",
      ended_at: "2026-03-15",
      created_at: "2026-01-28T09:00:00Z",
      updated_at: "2026-03-15T17:00:00Z",
    },
    {
      id: uid("task-008", TASK_IDS),
      kanban_board_id: uid("board-003", BOARD_IDS),
      project_id: uid("project-003", PROJECT_IDS),
      title: "데이터베이스 쿼리 최적화",
      description: "느린 쿼리 분석 및 인덱스 추가로 성능 개선",
      status: "done",
      priority: "high",
      assigned_user_id: USERS["user-004"].user_id,
      subtasks: [
        { id: "task-008-sub-1", title: "슬로우 쿼리 분석", completed: true },
        { id: "task-008-sub-2", title: "인덱스 설계 및 적용", completed: true },
        { id: "task-008-sub-3", title: "성능 비교 테스트", completed: true },
      ],
      memo: null,
      started_at: "2026-02-15",
      ended_at: "2026-04-10",
      created_at: "2026-02-10T10:00:00Z",
      updated_at: "2026-04-10T15:00:00Z",
    },
    {
      id: uid("task-009", TASK_IDS),
      kanban_board_id: uid("board-003", BOARD_IDS),
      project_id: uid("project-003", PROJECT_IDS),
      title: "에러 핸들링 개선",
      description: "통일된 에러 응답 형식 및 구조화된 로깅 시스템 구축",
      status: "done",
      priority: "normal",
      assigned_user_id: USERS["user-001"].user_id,
      subtasks: [
        { id: "task-009-sub-1", title: "에러 코드 체계 설계", completed: true },
        { id: "task-009-sub-2", title: "글로벌 에러 핸들러 구현", completed: true },
      ],
      memo: null,
      started_at: "2026-03-01",
      ended_at: "2026-04-25",
      created_at: "2026-02-25T11:00:00Z",
      updated_at: "2026-04-25T16:00:00Z",
    },
  ];
}

function buildMemos() {
  const u = (key) => USERS[key].user_id;
  const p = (key) => uid(key, PROJECT_IDS);
  return [
    // project-001
    {
      memo_id: uid("memo-001", MEMO_IDS),
      project_id: p("project-001"),
      user_id: u("user-001"),
      content: "5월 스프린트 목표: 메인 페이지 반응형 완성 + 성능 최적화 착수. 이번 주 금요일까지 UI 컴포넌트 PR 머지 필요.",
      is_pinned: true,
      pinned_at: "2026-05-01T09:00:00Z",
      is_deleted: false,
      deleted_at: null,
      reactions: { "👍": [u("user-002"), u("user-003")], "🔥": [u("user-002")] },
      label_color: "blue",
      created_at: "2026-05-01T09:00:00Z",
      updated_at: "2026-05-01T09:00:00Z",
    },
    {
      memo_id: uid("memo-002", MEMO_IDS),
      project_id: p("project-001"),
      user_id: u("user-002"),
      content: "Lighthouse 점수 현재 72점 → 목표 90점 이상. 이미지 lazy loading, 폰트 최적화 우선 진행 예정.",
      is_pinned: false,
      pinned_at: null,
      is_deleted: false,
      deleted_at: null,
      reactions: { "💡": [u("user-001")] },
      label_color: "yellow",
      created_at: "2026-05-08T14:00:00Z",
      updated_at: "2026-05-08T14:00:00Z",
    },
    {
      memo_id: uid("memo-003", MEMO_IDS),
      project_id: p("project-001"),
      user_id: u("user-003"),
      content: "디자인 시스템 컬러 토큰 정리 완료. Figma 링크 팀 채널에 공유함.",
      is_pinned: false,
      pinned_at: null,
      is_deleted: false,
      deleted_at: null,
      reactions: {},
      label_color: "green",
      created_at: "2026-05-12T11:30:00Z",
      updated_at: "2026-05-12T11:30:00Z",
    },

    // project-002
    {
      memo_id: uid("memo-004", MEMO_IDS),
      project_id: p("project-002"),
      user_id: u("user-002"),
      content: "Expo SDK 51로 업그레이드 완료. 네이티브 모듈 의존성 충돌 없음. 로그인 화면 개발 다음 주 완료 예상.",
      is_pinned: true,
      pinned_at: "2026-05-10T09:00:00Z",
      is_deleted: false,
      deleted_at: null,
      reactions: { "👍": [u("user-003"), u("user-004")] },
      label_color: "purple",
      created_at: "2026-05-10T09:00:00Z",
      updated_at: "2026-05-10T09:00:00Z",
    },
    {
      memo_id: uid("memo-005", MEMO_IDS),
      project_id: p("project-002"),
      user_id: u("user-004"),
      content: "FCM 설정 문서 확인 필요. Android target SDK 34 이상에서 알림 권한 요청 방식이 변경됨.",
      is_pinned: false,
      pinned_at: null,
      is_deleted: false,
      deleted_at: null,
      reactions: { "❗": [u("user-002")] },
      label_color: "red",
      created_at: "2026-05-13T15:00:00Z",
      updated_at: "2026-05-13T15:00:00Z",
    },
    {
      memo_id: uid("memo-006", MEMO_IDS),
      project_id: p("project-002"),
      user_id: u("user-003"),
      content: "디자인 리뷰 회의 2026-05-22 오후 2시. 온보딩 플로우 시안 준비해주세요.",
      is_pinned: false,
      pinned_at: null,
      is_deleted: false,
      deleted_at: null,
      reactions: { "✅": [u("user-002"), u("user-004")] },
      label_color: "orange",
      created_at: "2026-05-14T10:00:00Z",
      updated_at: "2026-05-14T10:00:00Z",
    },

    // project-003
    {
      memo_id: uid("memo-007", MEMO_IDS),
      project_id: p("project-003"),
      user_id: u("user-003"),
      content: "프로젝트 완료 회고 정리. 주요 성과: API 응답 속도 평균 43% 개선, Swagger 문서화 100% 달성.",
      is_pinned: true,
      pinned_at: "2026-04-30T17:00:00Z",
      is_deleted: false,
      deleted_at: null,
      reactions: { "🎉": [u("user-001"), u("user-004")], "👍": [u("user-001")] },
      label_color: "green",
      created_at: "2026-04-30T17:00:00Z",
      updated_at: "2026-04-30T17:00:00Z",
    },
    {
      memo_id: uid("memo-008", MEMO_IDS),
      project_id: p("project-003"),
      user_id: u("user-004"),
      content: "인덱스 추가 후 주문 목록 조회 쿼리 1.2s → 80ms로 개선. 복합 인덱스 설계 문서 Wiki에 업로드.",
      is_pinned: false,
      pinned_at: null,
      is_deleted: false,
      deleted_at: null,
      reactions: { "🚀": [u("user-001"), u("user-003")] },
      label_color: "blue",
      created_at: "2026-04-12T11:00:00Z",
      updated_at: "2026-04-12T11:00:00Z",
    },
  ];
}

function buildNotices() {
  const adminId = USERS["user-001"].user_id;
  return [
    {
      announcement_id: uid("notice-001", NOTICE_IDS),
      user_id: adminId,
      title: "[필독] 서비스 점검 안내 (2026-05-25 02:00–04:00)",
      content: `안녕하세요, Taskry 팀입니다.\n\n정기 서버 점검으로 인해 아래 시간 동안 서비스를 일시 중단합니다.\n\n- 점검 일시: 2026년 5월 25일 (월) 오전 2:00 ~ 4:00\n- 점검 내용: DB 마이그레이션, 보안 패치 적용\n\n점검 중에는 로그인 및 데이터 저장이 불가합니다.\n작업 중인 내용은 미리 저장해두시기 바랍니다.\n\n불편을 드려 죄송합니다.`,
      is_important: true,
      created_at: "2026-05-15T10:00:00Z",
      updated_at: "2026-05-15T10:00:00Z",
    },
    {
      announcement_id: uid("notice-002", NOTICE_IDS),
      user_id: adminId,
      title: "[업데이트] 칸반 보드 드래그 앤 드롭 개선",
      content: `칸반 보드의 드래그 앤 드롭 기능이 업데이트되었습니다.\n\n**주요 변경사항:**\n- 태스크를 컬럼 간 이동 시 애니메이션 추가\n- 여러 태스크 동시 선택 기능 지원\n- 모바일 터치 드래그 안정성 개선\n\n피드백은 하단 문의 채널로 남겨주세요.`,
      is_important: false,
      created_at: "2026-05-12T09:00:00Z",
      updated_at: "2026-05-12T09:00:00Z",
    },
    {
      announcement_id: uid("notice-003", NOTICE_IDS),
      user_id: adminId,
      title: "[공지] 5월 정기 팀 회의 일정 안내",
      content: `5월 정기 팀 회의 일정을 안내드립니다.\n\n- 일시: 2026년 5월 20일 (수) 오후 2:00\n- 장소: 화상 회의 (링크는 채널에 공유)\n- 안건: 1분기 성과 리뷰, 2분기 로드맵 논의\n\n참석 여부를 5월 18일까지 회신해주세요.`,
      is_important: false,
      created_at: "2026-05-10T14:00:00Z",
      updated_at: "2026-05-10T14:00:00Z",
    },
    {
      announcement_id: uid("notice-004", NOTICE_IDS),
      user_id: adminId,
      title: "[필독] 개인정보 처리방침 개정 안내",
      content: `개인정보 처리방침이 2026년 6월 1일부로 개정됩니다.\n\n주요 변경사항:\n1. 수집 항목에 '서비스 이용 기록' 추가\n2. 제3자 제공 조항 명확화\n3. 보관 기간 세분화\n\n개정된 처리방침은 공지일로부터 14일 후 적용됩니다.`,
      is_important: true,
      created_at: "2026-05-05T10:00:00Z",
      updated_at: "2026-05-05T10:00:00Z",
    },
    {
      announcement_id: uid("notice-005", NOTICE_IDS),
      user_id: adminId,
      title: "[업데이트] 캘린더 멀티뷰 기능 출시",
      content: `요청이 많았던 캘린더 멀티뷰 기능이 출시되었습니다.\n\n지원 뷰:\n- 월간 뷰 (기존)\n- 주간 뷰 (신규)\n- 일간 뷰 (신규)\n- 어젠다 뷰 (신규)\n\n프로젝트 워크스페이스 내 캘린더 탭에서 바로 이용하실 수 있습니다.`,
      is_important: false,
      created_at: "2026-04-28T09:00:00Z",
      updated_at: "2026-04-28T09:00:00Z",
    },
    {
      announcement_id: uid("notice-006", NOTICE_IDS),
      user_id: adminId,
      title: "[공지] 다크모드 정식 지원 시작",
      content: `Taskry에서 다크모드를 정식으로 지원합니다.\n\nGNB 우측 상단의 테마 토글 버튼을 통해 라이트/다크 모드를 전환할 수 있습니다.\n선택한 테마는 브라우저에 저장되어 다음 방문 시에도 유지됩니다.`,
      is_important: false,
      created_at: "2026-04-20T10:00:00Z",
      updated_at: "2026-04-20T10:00:00Z",
    },
    {
      announcement_id: uid("notice-007", NOTICE_IDS),
      user_id: adminId,
      title: "[업데이트] 프로젝트 메모 기능 추가",
      content: `프로젝트 워크스페이스에 메모 기능이 추가되었습니다.\n\n주요 기능:\n- 메모 작성 및 수정/삭제\n- 메모 고정(핀) 기능\n- 색상 레이블 (빨강/주황/노랑/초록/파랑/보라)\n- 이모지 반응 추가\n\n팀원들과 빠르게 메모를 공유해보세요!`,
      is_important: false,
      created_at: "2026-04-10T09:00:00Z",
      updated_at: "2026-04-10T09:00:00Z",
    },
    {
      announcement_id: uid("notice-008", NOTICE_IDS),
      user_id: adminId,
      title: "[필독] GitHub OAuth 로그인 추가 안내",
      content: `이제 GitHub 계정으로도 Taskry에 로그인할 수 있습니다.\n\n로그인 페이지에서 'GitHub으로 로그인' 버튼을 통해 이용해주세요.\n기존 Google 계정 로그인도 계속 지원됩니다.\n\n같은 이메일로 여러 OAuth를 연결하는 기능은 추후 지원 예정입니다.`,
      is_important: true,
      created_at: "2026-03-15T10:00:00Z",
      updated_at: "2026-03-15T10:00:00Z",
    },
  ];
}

// ─── Upsert 헬퍼 ────────────────────────────────────────────
async function upsertRows(supabase, table, rows, conflictColumn, label) {
  if (!rows.length) return;
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: conflictColumn });
  if (error) {
    console.error(`  ✗ ${label} 오류:`, error.message);
    throw error;
  }
  console.log(`  ✓ ${label}: ${rows.length}건 upsert`);
}

// ─── 실제 user_id 확인 (이미 로그인한 실제 유저와 매핑) ────
async function resolveAdminUserId(supabase, mockUserId) {
  const mockUser = USERS[mockUserId];
  const { data } = await supabase
    .from("users")
    .select("user_id")
    .eq("email", mockUser.email)
    .single();

  if (data) {
    if (data.user_id !== mockUser.user_id) {
      console.log(
        `  ℹ ${mockUser.user_name}(${mockUser.email}) 실제 UUID: ${data.user_id}`
      );
    }
    return data.user_id;
  }
  return mockUser.user_id;
}

// ─── main ────────────────────────────────────────────────────
async function main() {
  const root = process.cwd();
  loadEnvFile(path.join(root, ".env.local"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다."
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const reset = process.argv.includes("--reset");

  if (reset) {
    console.log("\n⚠️  --reset: 기존 목 데이터 삭제 중...");
    const taskIds = Object.values(TASK_IDS);
    const boardIds = Object.values(BOARD_IDS);
    const projectIds = Object.values(PROJECT_IDS);
    const memoIds = Object.values(MEMO_IDS);
    const noticeIds = Object.values(NOTICE_IDS);
    const userIds = [...Object.values(USERS).map((u) => u.user_id), ...EXTRA_USERS.map((u) => u.user_id)];

    await supabase.from("tasks").delete().in("id", taskIds);
    await supabase.from("project_memos").delete().in("memo_id", memoIds);
    await supabase.from("project_members").delete().in("project_id", projectIds);
    await supabase.from("kanban_boards").delete().in("id", boardIds);
    await supabase.from("notices").delete().in("announcement_id", noticeIds);
    await supabase.from("projects").delete().in("project_id", projectIds);
    await supabase.from("users").delete().in("user_id", userIds);
    console.log("  기존 데이터 삭제 완료\n");
  }

  console.log("\n📦 목 데이터 시딩 시작...\n");

  // 1. 사용자
  console.log("1. 사용자 시딩");
  const allUsers = [
    ...Object.values(USERS),
    ...EXTRA_USERS,
  ];
  await upsertRows(supabase, "users", allUsers, "email", "users");

  // 실제 admin 유저의 UUID 확인 (이미 OAuth 로그인한 경우 대비)
  const realAdminId = await resolveAdminUserId(supabase, "user-001");
  if (realAdminId !== USERS["user-001"].user_id) {
    console.log(
      "  ⚠️  admin 유저의 실제 UUID가 다릅니다. 공지사항 user_id를 실제 UUID로 교체합니다."
    );
    USERS["user-001"].user_id = realAdminId;
  }

  // 2. 프로젝트
  console.log("2. 프로젝트 시딩");
  await upsertRows(supabase, "projects", buildProjects(), "project_id", "projects");

  // 3. 프로젝트 멤버
  console.log("3. 프로젝트 멤버 시딩");
  await upsertRows(
    supabase,
    "project_members",
    buildProjectMembers(),
    "project_id,user_id",
    "project_members"
  );

  // 4. 칸반 보드
  console.log("4. 칸반 보드 시딩");
  await upsertRows(supabase, "kanban_boards", buildKanbanBoards(), "id", "kanban_boards");

  // 5. 태스크
  console.log("5. 태스크 시딩");
  await upsertRows(supabase, "tasks", buildTasks(), "id", "tasks");

  // 6. 프로젝트 메모
  console.log("6. 프로젝트 메모 시딩");
  await upsertRows(supabase, "project_memos", buildMemos(), "memo_id", "project_memos");

  // 7. 공지사항
  console.log("7. 공지사항 시딩");
  await upsertRows(supabase, "notices", buildNotices(), "announcement_id", "notices");

  console.log("\n✅ 시딩 완료!\n");
  console.log("  사용자     :", allUsers.length, "명");
  console.log("  프로젝트   :", buildProjects().length, "개");
  console.log("  칸반 보드  :", buildKanbanBoards().length, "개");
  console.log("  태스크     :", buildTasks().length, "개");
  console.log("  메모       :", buildMemos().length, "개");
  console.log("  공지사항   :", buildNotices().length, "개");
}

main().catch((err) => {
  console.error("\n❌ 시딩 실패:", err?.message || err);
  process.exitCode = 1;
});
