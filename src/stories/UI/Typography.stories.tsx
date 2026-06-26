import type { Meta, StoryObj } from "@storybook/react";

const TypographyDemo = () => (
  <div className="p-8 max-w-2xl space-y-10">
    {/* Heading Scale */}
    <section>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Heading Scale
      </p>
      <div className="space-y-4 border-l-2 border-main-200 pl-4">
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">text-3xl / font-bold — 페이지 제목</p>
          <h1 className="text-3xl font-bold text-foreground">작업 관리 시스템</h1>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">text-2xl / font-bold — 태스크 제목 (TaskDetail)</p>
          <h2 className="text-2xl font-bold text-foreground">UI 일관성 개선 작업</h2>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">text-xl / font-bold — 섹션 제목 (SectionHeader, TaskAdd)</p>
          <h2 className="text-xl font-bold text-foreground">새 작업 추가</h2>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">text-[18px] / font-semibold — 카드 제목 (ProjectCard)</p>
          <h3 className="font-semibold text-[18px] text-foreground">Taskry 프로젝트 관리</h3>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">text-base / font-semibold — 컬럼 제목 (KanbanColumn)</p>
          <h4 className="text-base font-semibold text-foreground">할 일</h4>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">text-sm / font-semibold — 서브 라벨</p>
          <p className="text-sm font-semibold text-foreground">담당자</p>
        </div>
      </div>
    </section>

    {/* Body Text */}
    <section>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Body Text
      </p>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">text-base — 기본 본문</p>
          <p className="text-base text-foreground">
            프로젝트 일정 관리와 팀 협업을 위한 통합 플랫폼입니다.
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">text-sm — 보조 본문</p>
          <p className="text-sm text-foreground">
            새 작업을 추가하고 팀원에게 할당할 수 있습니다.
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">text-sm / text-muted-foreground — 설명문</p>
          <p className="text-sm text-muted-foreground">
            설명이 없습니다. 여기에 작업 설명을 입력하세요.
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">text-xs — 메타 정보</p>
          <p className="text-xs text-muted-foreground">2026.06.25 마감</p>
        </div>
      </div>
    </section>

    {/* Color Tokens */}
    <section>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Text Color Tokens
      </p>
      <div className="space-y-2">
        {[
          { cls: "text-foreground", label: "text-foreground", desc: "기본 텍스트" },
          { cls: "text-muted-foreground", label: "text-muted-foreground", desc: "보조/메타 텍스트 (teal)" },
          { cls: "text-main-500", label: "text-main-500", desc: "브랜드 강조" },
          { cls: "text-main-600", label: "text-main-600", desc: "브랜드 강조 (다크)" },
          { cls: "text-destructive", label: "text-destructive", desc: "에러/경고" },
        ].map(({ cls, label, desc }) => (
          <div key={cls} className="flex items-center gap-3">
            <span className={`text-sm font-medium w-52 shrink-0 ${cls}`}>{label}</span>
            <span className="text-xs text-muted-foreground">{desc}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Font Weight */}
    <section>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Font Weight
      </p>
      <div className="space-y-2">
        {[
          { cls: "font-normal", label: "font-normal (400)", desc: "본문" },
          { cls: "font-medium", label: "font-medium (500)", desc: "강조 본문" },
          { cls: "font-semibold", label: "font-semibold (600)", desc: "서브 제목, 카드" },
          { cls: "font-bold", label: "font-bold (700)", desc: "제목 (표준 — 모든 h2/h3)" },
        ].map(({ cls, label, desc }) => (
          <div key={cls} className="flex items-center gap-3">
            <span className={`text-base text-foreground w-52 shrink-0 ${cls}`}>{label}</span>
            <span className="text-xs text-muted-foreground">{desc}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2 pl-1">
        * font-black (900)은 SectionHeader에서 제거됨 — 프로젝트 표준은 font-bold
      </p>
    </section>
  </div>
);

const meta: Meta = {
  title: "UI/Typography",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: "타이포그래피 스케일",
  render: () => <TypographyDemo />,
};

export const DarkMode: Story = {
  name: "다크모드",
  render: () => <TypographyDemo />,
  parameters: {
    backgrounds: { default: "dark" },
  },
};
