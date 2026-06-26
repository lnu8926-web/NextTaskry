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

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function pickUserByEmail(userMap, email) {
  const user = userMap[email];
  if (!user) {
    throw new Error(`User not found for email: ${email}`);
  }
  return user;
}

const DEMO_USERS = [
  {
    email: "demo.admin@taskry.dev",
    user_name: "김태현",
    profile_image: "https://avatars.githubusercontent.com/u/60370886",
    global_role: "admin",
    auth_provider: "github",
    is_active: true,
  },
  {
    email: "demo.pm@taskry.dev",
    user_name: "최민준",
    profile_image: "https://avatars.githubusercontent.com/u/10000000",
    global_role: "user",
    auth_provider: "google",
    is_active: true,
  },
  {
    email: "demo.dev1@taskry.dev",
    user_name: "이재원",
    profile_image: "https://avatars.githubusercontent.com/u/10000003",
    global_role: "user",
    auth_provider: "github",
    is_active: true,
  },
  {
    email: "demo.dev2@taskry.dev",
    user_name: "박소연",
    profile_image: "https://avatars.githubusercontent.com/u/10000004",
    global_role: "user",
    auth_provider: "google",
    is_active: true,
  },
];

const DEMO_PROJECTS = [
  {
    project_name: "[DEMO] Web Platform Renewal",
    description: "UI refresh, accessibility uplift, and performance improvements.",
    type: "web",
    status: "active",
    tech_stack: "Next.js, TypeScript, Tailwind",
    started_at: "2026-05-01",
    ended_at: "2026-07-15",
    ownerEmail: "demo.pm@taskry.dev",
    members: [
      { email: "demo.pm@taskry.dev", role: "leader" },
      { email: "demo.dev1@taskry.dev", role: "member" },
      { email: "demo.dev2@taskry.dev", role: "member" },
    ],
    board: {
      name: "Demo Web Board",
      description: "Kanban board for demo web renewal project",
      columns: "todo,inprogress,done",
    },
    tasks: [
      {
        title: "[DEMO] Improve landing hero and CTA",
        description: "Refine messaging hierarchy and improve conversion path.",
        status: "inprogress",
        priority: "high",
        assigneeEmail: "demo.dev1@taskry.dev",
        started_at: "2026-05-10",
        ended_at: "2026-05-30",
        memo: "Use event tracking for CTA clicks.",
        subtasks: [
          { id: "hero-copy", title: "Update hero copy", completed: true },
          { id: "hero-layout", title: "Adjust hero layout", completed: false },
          { id: "cta-track", title: "Add CTA analytics", completed: false },
        ],
      },
      {
        title: "[DEMO] Fix mobile navigation jitter",
        description: "Stabilize header transitions on iOS Safari.",
        status: "todo",
        priority: "normal",
        assigneeEmail: "demo.dev2@taskry.dev",
        started_at: null,
        ended_at: "2026-06-05",
        memo: null,
        subtasks: [
          { id: "repro-ios", title: "Reproduce on iPhone", completed: false },
          { id: "animation-guard", title: "Guard transition states", completed: false },
        ],
      },
      {
        title: "[DEMO] Audit lighthouse and bundle size",
        description: "Run audit and remove unused dependencies.",
        status: "done",
        priority: "high",
        assigneeEmail: "demo.pm@taskry.dev",
        started_at: "2026-05-03",
        ended_at: "2026-05-12",
        memo: "Largest contentful paint reduced by 35%.",
        subtasks: [
          { id: "audit-run", title: "Run baseline audit", completed: true },
          { id: "dep-clean", title: "Remove dead dependencies", completed: true },
        ],
      },
    ],
    memos: [
      {
        userEmail: "demo.pm@taskry.dev",
        content: "[DEMO] Sprint target: finish responsive polish and QA pass by Friday.",
        is_pinned: true,
        label_color: "blue",
        reactions: { "👍": ["demo.dev1@taskry.dev", "demo.dev2@taskry.dev"] },
      },
      {
        userEmail: "demo.dev1@taskry.dev",
        content: "[DEMO] Accessibility review: improve focus ring contrast in dark header.",
        is_pinned: false,
        label_color: "yellow",
        reactions: { "💡": ["demo.pm@taskry.dev"] },
      },
    ],
  },
  {
    project_name: "[DEMO] Mobile App Delivery",
    description: "Feature delivery for cross-platform mobile app.",
    type: "mobile",
    status: "active",
    tech_stack: "React Native, Expo",
    started_at: "2026-04-20",
    ended_at: "2026-08-31",
    ownerEmail: "demo.dev1@taskry.dev",
    members: [
      { email: "demo.dev1@taskry.dev", role: "leader" },
      { email: "demo.dev2@taskry.dev", role: "member" },
      { email: "demo.pm@taskry.dev", role: "member" },
    ],
    board: {
      name: "Demo Mobile Board",
      description: "Kanban board for demo mobile delivery",
      columns: "todo,inprogress,done",
    },
    tasks: [
      {
        title: "[DEMO] Implement social login flow",
        description: "Support GitHub and Google login in app onboarding.",
        status: "inprogress",
        priority: "high",
        assigneeEmail: "demo.dev2@taskry.dev",
        started_at: "2026-05-08",
        ended_at: "2026-06-01",
        memo: "Align OAuth callback with deep link handler.",
        subtasks: [
          { id: "oauth-ui", title: "Build OAuth buttons", completed: true },
          { id: "oauth-callback", title: "Handle callback route", completed: false },
          { id: "oauth-error", title: "Display auth error states", completed: false },
        ],
      },
      {
        title: "[DEMO] Push notification baseline",
        description: "Set up push permissions and test broadcast notifications.",
        status: "todo",
        priority: "normal",
        assigneeEmail: "demo.pm@taskry.dev",
        started_at: null,
        ended_at: "2026-06-20",
        memo: null,
        subtasks: [],
      },
    ],
    memos: [
      {
        userEmail: "demo.dev2@taskry.dev",
        content: "[DEMO] Android notification permission flow changed for API 34.",
        is_pinned: false,
        label_color: "red",
        reactions: { "❗": ["demo.dev1@taskry.dev"] },
      },
    ],
  },
];

const DEMO_NOTICES = [
  {
    title: "[DEMO] Scheduled maintenance notice",
    content:
      "Demo environment maintenance is scheduled from 02:00 to 04:00 UTC. During this window, logins and writes may be temporarily unavailable.",
    is_important: true,
    authorEmail: "demo.admin@taskry.dev",
  },
  {
    title: "[DEMO] Kanban interaction update",
    content:
      "Kanban drag and drop interactions were improved for mobile stability and smoother transitions.",
    is_important: false,
    authorEmail: "demo.admin@taskry.dev",
  },
  {
    title: "[DEMO] Calendar multi-view enabled",
    content:
      "Month, week, day, and agenda views are now available in the demo workspace.",
    is_important: false,
    authorEmail: "demo.admin@taskry.dev",
  },
];

async function ensureUsers(supabase) {
  const emails = DEMO_USERS.map((u) => u.email);

  const { data: existingUsers, error: fetchError } = await supabase
    .from("users")
    .select("user_id, email")
    .in("email", emails);

  if (fetchError) throw fetchError;

  const existingMap = Object.fromEntries(
    (existingUsers || []).map((u) => [u.email, u])
  );

  const toInsert = DEMO_USERS.filter((u) => !existingMap[u.email]).map((u) => ({
    ...u,
    updated_at: new Date().toISOString(),
  }));

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from("users").insert(toInsert);
    if (insertError) throw insertError;
  }

  const { data: allUsers, error: finalFetchError } = await supabase
    .from("users")
    .select("user_id, email")
    .in("email", emails);

  if (finalFetchError) throw finalFetchError;

  return Object.fromEntries((allUsers || []).map((u) => [u.email, u]));
}

async function ensureProject(supabase, project, ownerUserId) {
  const { data: foundRows, error: findError } = await supabase
    .from("projects")
    .select("project_id")
    .eq("project_name", project.project_name)
    .order("created_at", { ascending: true })
    .limit(1);

  if (findError) throw findError;

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

  if (foundRows && foundRows.length > 0) {
    const projectId = foundRows[0].project_id;
    const { error: updateError } = await supabase
      .from("projects")
      .update(payload)
      .eq("project_id", projectId);

    if (updateError) throw updateError;
    return projectId;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("projects")
    .insert(payload)
    .select("project_id")
    .single();

  if (insertError) throw insertError;
  return inserted.project_id;
}

async function ensureProjectMembers(supabase, projectId, members, userMap) {
  const rows = members.map((m) => ({
    project_id: projectId,
    user_id: pickUserByEmail(userMap, m.email).user_id,
    role: m.role,
  }));

  const { error } = await supabase
    .from("project_members")
    .upsert(rows, { onConflict: "project_id,user_id" });

  if (error) throw error;
}

async function ensureBoard(supabase, projectId, board) {
  const { data: existingBoards, error: findError } = await supabase
    .from("kanban_boards")
    .select("id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (findError) throw findError;

  const payload = {
    name: board.name,
    description: board.description,
    project_id: projectId,
    columns: board.columns,
  };

  if (existingBoards && existingBoards.length > 0) {
    const boardId = existingBoards[0].id;
    const { error: updateError } = await supabase
      .from("kanban_boards")
      .update(payload)
      .eq("id", boardId);

    if (updateError) throw updateError;
    return boardId;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("kanban_boards")
    .insert(payload)
    .select("id")
    .single();

  if (insertError) throw insertError;
  return inserted.id;
}

async function ensureTasks(supabase, projectId, boardId, tasks, userMap) {
  for (const task of tasks) {
    const assigneeId = task.assigneeEmail
      ? pickUserByEmail(userMap, task.assigneeEmail).user_id
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

    const { data: foundRows, error: findError } = await supabase
      .from("tasks")
      .select("id")
      .eq("project_id", projectId)
      .eq("title", task.title)
      .limit(1);

    if (findError) throw findError;

    if (foundRows && foundRows.length > 0) {
      const { error: updateError } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", foundRows[0].id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("tasks").insert(payload);
      if (insertError) throw insertError;
    }
  }
}

async function ensureMemos(supabase, projectId, memos, userMap) {
  for (const memo of memos) {
    const userId = pickUserByEmail(userMap, memo.userEmail).user_id;
    const now = new Date().toISOString();

    const payload = {
      project_id: projectId,
      user_id: userId,
      content: memo.content,
      is_pinned: memo.is_pinned,
      pinned_at: memo.is_pinned ? now : null,
      is_deleted: false,
      deleted_at: null,
      reactions: Object.fromEntries(
        Object.entries(memo.reactions || {}).map(([emoji, emails]) => [
          emoji,
          (emails || []).map((email) => pickUserByEmail(userMap, email).user_id),
        ])
      ),
      label_color: memo.label_color ?? null,
      updated_at: now,
    };

    const { data: foundRows, error: findError } = await supabase
      .from("project_memos")
      .select("memo_id")
      .eq("project_id", projectId)
      .eq("content", memo.content)
      .limit(1);

    if (findError) throw findError;

    if (foundRows && foundRows.length > 0) {
      const { error: updateError } = await supabase
        .from("project_memos")
        .update(payload)
        .eq("memo_id", foundRows[0].memo_id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("project_memos")
        .insert(payload);
      if (insertError) throw insertError;
    }
  }
}

async function ensureNotices(supabase, notices, userMap) {
  for (const notice of notices) {
    const authorUserId = pickUserByEmail(userMap, notice.authorEmail).user_id;

    const payload = {
      user_id: authorUserId,
      title: notice.title,
      content: notice.content,
      is_important: notice.is_important,
      updated_at: new Date().toISOString(),
    };

    const { data: foundRows, error: findError } = await supabase
      .from("notices")
      .select("announcement_id")
      .eq("title", notice.title)
      .limit(1);

    if (findError) throw findError;

    if (foundRows && foundRows.length > 0) {
      const { error: updateError } = await supabase
        .from("notices")
        .update(payload)
        .eq("announcement_id", foundRows[0].announcement_id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("notices").insert(payload);
      if (insertError) throw insertError;
    }
  }
}

async function main() {
  const root = process.cwd();
  loadEnvFile(path.join(root, ".env.local"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const userMap = await ensureUsers(supabase);

  for (const project of DEMO_PROJECTS) {
    const ownerId = pickUserByEmail(userMap, project.ownerEmail).user_id;
    const projectId = await ensureProject(supabase, project, ownerId);
    const boardId = await ensureBoard(supabase, projectId, project.board);

    await ensureProjectMembers(supabase, projectId, project.members, userMap);
    await ensureTasks(supabase, projectId, boardId, project.tasks, userMap);
    await ensureMemos(supabase, projectId, project.memos, userMap);
  }

  await ensureNotices(supabase, DEMO_NOTICES, userMap);

  console.log("DEMO_SEED_COMPLETED");
  console.log(`Users: ${DEMO_USERS.length}`);
  console.log(`Projects: ${DEMO_PROJECTS.length}`);
  console.log(`Notices: ${DEMO_NOTICES.length}`);
}

main().catch((error) => {
  console.error("DEMO_SEED_FAILED");
  console.error(error?.message || error);
  process.exitCode = 1;
});
