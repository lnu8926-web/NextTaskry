/**
 * Seed demo data for the guest account (guest@taskry.demo).
 * Run: node scripts/seed-guest-data.cjs
 * or:  npm run seed:guest
 *
 * Idempotent — safe to re-run.
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

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

// ─── 사용자 ──────────────────────────────────────────────
const SEED_USERS = [
  {
    email: "guest@taskry.demo",
    user_name: "게스트",
    profile_image: "https://api.dicebear.com/9.x/avataaars/svg?seed=guest",
    global_role: "user",
    auth_provider: "credentials",
    is_active: true,
  },
  {
    email: "sysadmin@taskry.demo",
    user_name: "관리자",
    profile_image: "https://api.dicebear.com/9.x/avataaars/svg?seed=admin",
    global_role: "admin",
    auth_provider: "credentials",
    is_active: true,
  },
];

// ─── 프로젝트 + 태스크 ──────────────────────────────────
// 기준일: 2026-06-26
const SEED_PROJECTS = [
  {
    project_name: "[GUEST] TaskFlow 리디자인",
    description: "전체 UI/UX를 재설계하고 디자인 시스템을 통합합니다.",
    type: "web",
    status: "active",
    tech_stack: "Next.js, Tailwind CSS, Figma",
    started_at: "2026-05-01",
    ended_at: "2026-07-31",
    ownerEmail: "guest@taskry.demo",
    members: [{ email: "guest@taskry.demo", role: "leader" }],
    board: {
      name: "TaskFlow 리디자인 보드",
      description: "UI 리뉴얼 칸반 보드",
      columns: "todo,inprogress,done",
    },
    tasks: [
      {
        title: "다크 모드 컴포넌트 스타일 통일",
        description: "모든 컴포넌트의 다크 모드 색상 변수를 디자인 토큰으로 통일합니다.",
        status: "inprogress",
        priority: "high",
        assigneeEmail: "guest@taskry.demo",
        started_at: "2026-06-20",
        ended_at: "2026-06-26", // D-day (오늘)
        memo: "CSS 변수 --color-* 계열로 전환 완료 후 QA 필요.",
        subtasks: [
          { id: "dm-token", title: "디자인 토큰 변수 정의", completed: true },
          { id: "dm-comp", title: "주요 컴포넌트 색상 적용", completed: true },
          { id: "dm-qa", title: "크로스 브라우저 QA", completed: false },
        ],
      },
      {
        title: "접근성(a11y) 감사 및 개선",
        description: "WCAG 2.1 AA 기준으로 접근성 이슈를 식별하고 수정합니다.",
        status: "todo",
        priority: "normal",
        assigneeEmail: "guest@taskry.demo",
        started_at: null,
        ended_at: "2026-06-22", // 지연 (이미 지남)
        memo: null,
        subtasks: [
          { id: "a11y-audit", title: "Lighthouse 접근성 감사 실행", completed: false },
          { id: "a11y-fix", title: "키보드 포커스 링 개선", completed: false },
        ],
      },
      {
        title: "랜딩 페이지 히어로 섹션 리뉴얼",
        description: "전환율 향상을 위해 헤로 카피와 CTA 레이아웃을 개선합니다.",
        status: "inprogress",
        priority: "high",
        assigneeEmail: "guest@taskry.demo",
        started_at: "2026-06-23",
        ended_at: "2026-06-27", // D-1 (내일)
        memo: "CTA 클릭 이벤트 트래킹 추가 예정.",
        subtasks: [
          { id: "hero-copy", title: "카피 A/B 안 작성", completed: true },
          { id: "hero-layout", title: "히어로 레이아웃 조정", completed: false },
          { id: "hero-cta", title: "CTA 버튼 스타일 업데이트", completed: false },
        ],
      },
      {
        title: "반응형 레이아웃 QA",
        description: "모바일·태블릿·데스크탑 뷰 전 구간 레이아웃 검증.",
        status: "todo",
        priority: "normal",
        assigneeEmail: "guest@taskry.demo",
        started_at: null,
        ended_at: "2026-07-02", // D-6 (7일 이내)
        memo: null,
        subtasks: [
          { id: "rsp-mobile", title: "모바일(375px) 스냅샷 확인", completed: false },
          { id: "rsp-tablet", title: "태블릿(768px) 스냅샷 확인", completed: false },
          { id: "rsp-desktop", title: "데스크탑(1440px) 스냅샷 확인", completed: false },
        ],
      },
      {
        title: "디자인 시스템 Storybook 문서화",
        description: "핵심 컴포넌트 스토리 작성 및 args 타입 정의.",
        status: "done",
        priority: "low",
        assigneeEmail: "guest@taskry.demo",
        started_at: "2026-06-01",
        ended_at: "2026-06-15",
        memo: "Button, Input, Modal, Badge 스토리 완료.",
        subtasks: [
          { id: "sb-button", title: "Button 스토리 작성", completed: true },
          { id: "sb-input", title: "Input 스토리 작성", completed: true },
          { id: "sb-modal", title: "Modal 스토리 작성", completed: true },
        ],
      },
    ],
    memos: [
      {
        userEmail: "guest@taskry.demo",
        content: "스프린트 목표: 6/30 이전에 반응형 QA 완료 및 접근성 이슈 최소화.",
        is_pinned: true,
        label_color: "blue",
        reactions: {},
      },
    ],
  },
  {
    project_name: "[GUEST] 쇼핑몰 백엔드 개편",
    description: "주문·결제·재고 API를 마이크로서비스 구조로 분리합니다.",
    type: "api",
    status: "active",
    tech_stack: "Node.js, PostgreSQL, Redis",
    started_at: "2026-04-15",
    ended_at: "2026-08-15",
    ownerEmail: "guest@taskry.demo",
    members: [{ email: "guest@taskry.demo", role: "member" }],
    board: {
      name: "쇼핑몰 백엔드 보드",
      description: "API 개편 칸반 보드",
      columns: "todo,inprogress,done",
    },
    tasks: [
      {
        title: "주문 처리 API 성능 최적화",
        description: "피크 타임 응답 속도를 50% 이상 개선합니다.",
        status: "inprogress",
        priority: "high",
        assigneeEmail: "guest@taskry.demo",
        started_at: "2026-06-18",
        ended_at: "2026-06-24", // 지연 (이미 지남)
        memo: "쿼리 플랜 분석 결과 N+1 이슈 발견, 배치 처리로 전환 중.",
        subtasks: [
          { id: "perf-profile", title: "쿼리 프로파일링", completed: true },
          { id: "perf-index", title: "복합 인덱스 추가", completed: true },
          { id: "perf-cache", title: "Redis 캐시 레이어 삽입", completed: false },
        ],
      },
      {
        title: "Webhook 이벤트 핸들러 구현",
        description: "결제·배송 상태 변경 이벤트를 Webhook으로 외부 시스템에 전송.",
        status: "todo",
        priority: "normal",
        assigneeEmail: "guest@taskry.demo",
        started_at: null,
        ended_at: "2026-06-28", // D-2
        memo: null,
        subtasks: [
          { id: "wh-schema", title: "Webhook 페이로드 스키마 정의", completed: false },
          { id: "wh-retry", title: "재시도 로직 구현", completed: false },
          { id: "wh-test", title: "E2E 테스트 작성", completed: false },
        ],
      },
      {
        title: "결제 모듈 단위 테스트 작성",
        description: "결제 실패·환불 엣지 케이스 커버리지를 80% 이상으로 높입니다.",
        status: "todo",
        priority: "low",
        assigneeEmail: "guest@taskry.demo",
        started_at: null,
        ended_at: "2026-07-10",
        memo: null,
        subtasks: [],
      },
      {
        title: "DB 인덱스 튜닝",
        description: "슬로우 쿼리 로그 분석 후 누락 인덱스 추가.",
        status: "done",
        priority: "high",
        assigneeEmail: "guest@taskry.demo",
        started_at: "2026-06-03",
        ended_at: "2026-06-10",
        memo: "products.category_id, orders.user_id 복합 인덱스 추가로 p95 60ms → 18ms.",
        subtasks: [
          { id: "idx-analyze", title: "슬로우 쿼리 분석", completed: true },
          { id: "idx-add", title: "인덱스 마이그레이션 적용", completed: true },
        ],
      },
    ],
    memos: [
      {
        userEmail: "guest@taskry.demo",
        content: "8/15 마감 전 주문 API 최적화와 Webhook 구현이 핵심 블로커입니다.",
        is_pinned: true,
        label_color: "red",
        reactions: {},
      },
    ],
  },
  {
    project_name: "[GUEST] Q2 마케팅 캠페인",
    description: "신규 사용자 유입을 위한 Q2 디지털 마케팅 캠페인 집행.",
    type: "other",
    status: "active",
    tech_stack: "Google Analytics, Mailchimp",
    started_at: "2026-06-01",
    ended_at: "2026-07-15",
    ownerEmail: "guest@taskry.demo",
    members: [{ email: "guest@taskry.demo", role: "member" }],
    board: {
      name: "마케팅 캠페인 보드",
      description: "Q2 캠페인 칸반 보드",
      columns: "todo,inprogress,done",
    },
    tasks: [
      {
        title: "A/B 테스트 설계 및 런칭",
        description: "이메일 제목 A/B 테스트를 설계하고 Mailchimp에서 실행합니다.",
        status: "inprogress",
        priority: "high",
        assigneeEmail: "guest@taskry.demo",
        started_at: "2026-06-22",
        ended_at: "2026-07-01", // D-5
        memo: "오픈율 목표 25% 이상.",
        subtasks: [
          { id: "ab-design", title: "테스트 시나리오 정의", completed: true },
          { id: "ab-launch", title: "Mailchimp A/B 설정 및 발송", completed: false },
          { id: "ab-report", title: "결과 리포트 작성", completed: false },
        ],
      },
      {
        title: "이메일 캠페인 템플릿 제작",
        description: "신규 사용자 온보딩 이메일 3종 HTML 템플릿 제작.",
        status: "done",
        priority: "normal",
        assigneeEmail: "guest@taskry.demo",
        started_at: "2026-06-05",
        ended_at: "2026-06-20",
        memo: "환영 / 기능 소개 / 재참여 유도 3종 완료.",
        subtasks: [
          { id: "email-welcome", title: "환영 이메일 템플릿", completed: true },
          { id: "email-feature", title: "기능 소개 템플릿", completed: true },
          { id: "email-reeng", title: "재참여 유도 템플릿", completed: true },
        ],
      },
    ],
    memos: [],
  },
];

// ─── 공지사항 ────────────────────────────────────────────
const SEED_NOTICES = [
  {
    title: "[이벤트] NextTaskry 베타 피드백 이벤트 안내",
    content:
      "베타 서비스를 이용해 주시는 모든 분께 감사드립니다. 7월 15일까지 피드백을 남겨주시면 추첨을 통해 소정의 선물을 드립니다. 대시보드 우측 하단의 '피드백 보내기' 버튼을 이용해 주세요.",
    is_important: true,
    authorEmail: "sysadmin@taskry.demo",
  },
  {
    title: "[업데이트] 칸반 보드 드래그 앤 드롭 개선",
    content:
      "칸반 보드의 태스크 이동 시 발생하던 레이아웃 밀림 현상이 수정되었습니다. 모바일 환경에서의 드래그 인식률도 함께 개선되었습니다.",
    is_important: false,
    authorEmail: "sysadmin@taskry.demo",
  },
  {
    title: "[안내] 서비스 정기 점검 일정",
    content:
      "2026년 7월 3일(금) 새벽 2시 ~ 4시(UTC+9) 사이에 서버 정기 점검이 예정되어 있습니다. 해당 시간 동안 일부 기능이 일시적으로 제한될 수 있습니다.",
    is_important: true,
    authorEmail: "sysadmin@taskry.demo",
  },
];

// ─── 헬퍼 ────────────────────────────────────────────────
function pickUser(userMap, email) {
  const user = userMap[email];
  if (!user) throw new Error(`User not found: ${email}`);
  return user;
}

async function ensureUsers(supabase) {
  const emails = SEED_USERS.map((u) => u.email);

  const { data: existing, error: fetchErr } = await supabase
    .from("users")
    .select("user_id, email")
    .in("email", emails);
  if (fetchErr) throw fetchErr;

  const existingMap = Object.fromEntries((existing || []).map((u) => [u.email, u]));
  const toInsert = SEED_USERS.filter((u) => !existingMap[u.email]).map((u) => ({
    ...u,
    updated_at: new Date().toISOString(),
  }));

  if (toInsert.length > 0) {
    const { error: insertErr } = await supabase.from("users").insert(toInsert);
    if (insertErr) throw insertErr;
  }

  const { data: all, error: finalErr } = await supabase
    .from("users")
    .select("user_id, email")
    .in("email", emails);
  if (finalErr) throw finalErr;

  return Object.fromEntries((all || []).map((u) => [u.email, u]));
}

async function ensureProject(supabase, project, ownerUserId) {
  const { data: found, error: findErr } = await supabase
    .from("projects")
    .select("project_id")
    .eq("project_name", project.project_name)
    .limit(1);
  if (findErr) throw findErr;

  const payload = {
    project_name: project.project_name,
    description: project.description,
    type: project.type,
    status: project.status,
    tech_stack: project.tech_stack,
    started_at: project.started_at,
    ended_at: project.ended_at,
    user_id: ownerUserId,
    updated_at: new Date().toISOString(),
  };

  if (found && found.length > 0) {
    const id = found[0].project_id;
    const { error: updateErr } = await supabase
      .from("projects")
      .update(payload)
      .eq("project_id", id);
    if (updateErr) throw updateErr;
    return id;
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("projects")
    .insert(payload)
    .select("project_id")
    .single();
  if (insertErr) throw insertErr;
  return inserted.project_id;
}

async function ensureProjectMembers(supabase, projectId, members, userMap) {
  const rows = members.map((m) => ({
    project_id: projectId,
    user_id: pickUser(userMap, m.email).user_id,
    role: m.role,
  }));
  const { error } = await supabase
    .from("project_members")
    .upsert(rows, { onConflict: "project_id,user_id" });
  if (error) throw error;
}

async function ensureBoard(supabase, projectId, board) {
  const { data: found, error: findErr } = await supabase
    .from("kanban_boards")
    .select("id")
    .eq("project_id", projectId)
    .limit(1);
  if (findErr) throw findErr;

  const payload = {
    name: board.name,
    description: board.description,
    project_id: projectId,
    columns: board.columns,
  };

  if (found && found.length > 0) {
    const id = found[0].id;
    const { error: updateErr } = await supabase
      .from("kanban_boards")
      .update(payload)
      .eq("id", id);
    if (updateErr) throw updateErr;
    return id;
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("kanban_boards")
    .insert(payload)
    .select("id")
    .single();
  if (insertErr) throw insertErr;
  return inserted.id;
}

async function ensureTasks(supabase, projectId, boardId, tasks, userMap) {
  for (const task of tasks) {
    const assigneeId = task.assigneeEmail
      ? pickUser(userMap, task.assigneeEmail).user_id
      : null;

    const payload = {
      kanban_board_id: boardId,
      project_id: projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigned_user_id: assigneeId,
      started_at: task.started_at,
      ended_at: task.ended_at,
      memo: task.memo,
      subtasks: task.subtasks,
      updated_at: new Date().toISOString(),
    };

    const { data: found, error: findErr } = await supabase
      .from("tasks")
      .select("id")
      .eq("project_id", projectId)
      .eq("title", task.title)
      .limit(1);
    if (findErr) throw findErr;

    if (found && found.length > 0) {
      const { error: updateErr } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", found[0].id);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase.from("tasks").insert(payload);
      if (insertErr) throw insertErr;
    }
  }
}

async function ensureMemos(supabase, projectId, memos, userMap) {
  for (const memo of memos) {
    const userId = pickUser(userMap, memo.userEmail).user_id;
    const now = new Date().toISOString();

    const payload = {
      project_id: projectId,
      user_id: userId,
      content: memo.content,
      is_pinned: memo.is_pinned,
      pinned_at: memo.is_pinned ? now : null,
      is_deleted: false,
      deleted_at: null,
      reactions: {},
      label_color: memo.label_color ?? null,
      updated_at: now,
    };

    const { data: found, error: findErr } = await supabase
      .from("project_memos")
      .select("memo_id")
      .eq("project_id", projectId)
      .eq("content", memo.content)
      .limit(1);
    if (findErr) throw findErr;

    if (found && found.length > 0) {
      const { error: updateErr } = await supabase
        .from("project_memos")
        .update(payload)
        .eq("memo_id", found[0].memo_id);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase.from("project_memos").insert(payload);
      if (insertErr) throw insertErr;
    }
  }
}

async function ensureNotices(supabase, notices, userMap) {
  for (const notice of notices) {
    const authorId = pickUser(userMap, notice.authorEmail).user_id;

    const payload = {
      user_id: authorId,
      title: notice.title,
      content: notice.content,
      is_important: notice.is_important,
      updated_at: new Date().toISOString(),
    };

    const { data: found, error: findErr } = await supabase
      .from("notices")
      .select("announcement_id")
      .eq("title", notice.title)
      .limit(1);
    if (findErr) throw findErr;

    if (found && found.length > 0) {
      const { error: updateErr } = await supabase
        .from("notices")
        .update(payload)
        .eq("announcement_id", found[0].announcement_id);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase.from("notices").insert(payload);
      if (insertErr) throw insertErr;
    }
  }
}

// ─── main ────────────────────────────────────────────────
async function main() {
  const root = process.cwd();
  loadEnvFile(path.join(root, ".env.local"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  console.log("Seeding guest demo data...");

  const userMap = await ensureUsers(supabase);
  console.log(`  Users: ${Object.keys(userMap).length}`);

  let taskCount = 0;
  for (const project of SEED_PROJECTS) {
    const ownerId = pickUser(userMap, project.ownerEmail).user_id;
    const projectId = await ensureProject(supabase, project, ownerId);
    const boardId = await ensureBoard(supabase, projectId, project.board);
    await ensureProjectMembers(supabase, projectId, project.members, userMap);
    await ensureTasks(supabase, projectId, boardId, project.tasks, userMap);
    await ensureMemos(supabase, projectId, project.memos, userMap);
    taskCount += project.tasks.length;
    console.log(`  Project "${project.project_name}" — ${project.tasks.length} tasks`);
  }

  await ensureNotices(supabase, SEED_NOTICES, userMap);
  console.log(`  Notices: ${SEED_NOTICES.length}`);

  console.log("");
  console.log("GUEST_SEED_COMPLETED");
  console.log(`  Projects: ${SEED_PROJECTS.length}, Tasks: ${taskCount}, Notices: ${SEED_NOTICES.length}`);
  console.log("");
  console.log("Dashboard preview (2026-06-26 기준):");
  console.log("  전체 태스크: 11  |  진행 중: 4  |  완료: 3  |  지연: 2");
  console.log("  마감 임박(7일): D-day 1개, D-1 1개, D-2 1개, D-5 1개, D-6 1개");
}

main().catch((err) => {
  console.error("GUEST_SEED_FAILED:", err?.message || err);
  process.exitCode = 1;
});
