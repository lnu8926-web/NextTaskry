-- ============================================================
-- users 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  user_id   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email     TEXT        NOT NULL UNIQUE,
  user_name TEXT,
  profile_image TEXT,
  global_role   TEXT    NOT NULL DEFAULT 'user',
  auth_provider TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- projects 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  project_id   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID,
  project_name TEXT NOT NULL,
  description  TEXT,
  type         TEXT,
  status       TEXT NOT NULL DEFAULT 'active',
  tech_stack   TEXT,
  started_at   DATE,
  ended_at     DATE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- project_members 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS project_members (
  member_id  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id    UUID NOT NULL,
  role       TEXT NOT NULL DEFAULT 'member',
  joined_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

-- ============================================================
-- notices (공지사항) 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
  announcement_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID,
  title           TEXT    NOT NULL,
  content         TEXT    NOT NULL,
  is_important    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- project_memos 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS project_memos (
  memo_id    UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID    NOT NULL,
  user_id    UUID    NOT NULL,
  content    TEXT    NOT NULL,
  is_pinned  BOOLEAN NOT NULL DEFAULT false,
  pinned_at  TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  reactions  JSONB   NOT NULL DEFAULT '{}',
  label_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
