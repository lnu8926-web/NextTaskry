import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "@/components/shared/Icon";

const ALL_ICONS = [
  // Theme
  { key: "sun", label: "sun", group: "Theme" },
  { key: "moon", label: "moon", group: "Theme" },
  { key: "sunMoon", label: "sunMoon", group: "Theme" },
  // User
  { key: "users", label: "users", group: "User" },
  { key: "userPlus", label: "userPlus", group: "User" },
  { key: "userCircle", label: "userCircle", group: "User" },
  { key: "userCheck", label: "userCheck", group: "User" },
  // CRUD
  { key: "pencil", label: "pencil", group: "CRUD" },
  { key: "edit", label: "edit", group: "CRUD" },
  { key: "trash", label: "trash", group: "CRUD" },
  { key: "alertTriangle", label: "alertTriangle", group: "CRUD" },
  // Calendar & Clock
  { key: "calendar", label: "calendar", group: "Calendar" },
  { key: "calendarPlus", label: "calendarPlus", group: "Calendar" },
  { key: "calendarCheck", label: "calendarCheck", group: "Calendar" },
  { key: "calendarShare", label: "calendarShare", group: "Calendar" },
  { key: "calendarStar", label: "calendarStar", group: "Calendar" },
  { key: "calendarEvent", label: "calendarEvent", group: "Calendar" },
  { key: "clock", label: "clock", group: "Calendar" },
  // Search
  { key: "search", label: "search", group: "Search" },
  { key: "filter", label: "filter", group: "Search" },
  // Project
  { key: "board", label: "board", group: "Project" },
  { key: "notes", label: "notes", group: "Project" },
  { key: "checkList", label: "checkList", group: "Project" },
  { key: "details", label: "details", group: "Project" },
  { key: "kanban", label: "kanban", group: "Project" },
  { key: "squareCheck", label: "squareCheck", group: "Project" },
  { key: "squareCheckFilled", label: "squareCheckFilled", group: "Project" },
  { key: "folder", label: "folder", group: "Project" },
  // Circle / Status
  { key: "circle", label: "circle", group: "Status" },
  { key: "circleCheck", label: "circleCheck", group: "Status" },
  { key: "circleCheckFilled", label: "circleCheckFilled", group: "Status" },
  { key: "circleInfo", label: "circleInfo", group: "Status" },
  { key: "circlePlus", label: "circlePlus", group: "Status" },
  { key: "circlePlusFilled", label: "circlePlusFilled", group: "Status" },
  { key: "progressAlert", label: "progressAlert", group: "Status" },
  { key: "alertCircleFilled", label: "alertCircleFilled", group: "Status" },
  // Navigation
  { key: "arrowLeft", label: "arrowLeft", group: "Navigation" },
  { key: "arrowDown", label: "arrowDown", group: "Navigation" },
  { key: "chevronRight", label: "chevronRight", group: "Navigation" },
  // Etc
  { key: "x", label: "x", group: "Etc" },
  { key: "plus", label: "plus", group: "Etc" },
  { key: "google", label: "google", group: "Etc" },
  { key: "github", label: "github", group: "Etc" },
  { key: "eye", label: "eye", group: "Etc" },
  { key: "imageSquare", label: "imageSquare", group: "Etc" },
  { key: "speakerPhone", label: "speakerPhone", group: "Etc" },
  { key: "speakerphone", label: "speakerphone", group: "Etc" },
  { key: "dot", label: "dot", group: "Etc" },
  { key: "dotsVertical", label: "dotsVertical", group: "Etc" },
  { key: "description", label: "description", group: "Etc" },
  { key: "bellFilled", label: "bellFilled", group: "Etc" },
  { key: "inbox", label: "inbox", group: "Etc" },
  { key: "clipboard", label: "clipboard", group: "Etc" },
  { key: "loading", label: "loading", group: "Etc" },
  { key: "list", label: "list", group: "Etc" },
  { key: "deviceFloppy", label: "deviceFloppy", group: "Etc" },
  { key: "crown", label: "crown", group: "Etc" },
] as const;

type IconKey = (typeof ALL_ICONS)[number]["key"];
const GROUPS = [...new Set(ALL_ICONS.map((i) => i.group))];

const IconGrid = ({ size = 24, color }: { size?: number; color?: string }) => (
  <div className="p-6 space-y-8">
    {GROUPS.map((group) => (
      <section key={group}>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {group}
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
          {ALL_ICONS.filter((i) => i.group === group).map(({ key, label }) => (
            <div
              key={key}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border hover:bg-muted/40 transition-colors"
              title={label}
            >
              <Icon type={key as IconKey} size={size} color={color} />
              <span className="text-[10px] text-muted-foreground text-center leading-tight break-all">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

const meta: Meta = {
  title: "UI/IconCatalog",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: "전체 아이콘 (24px)",
  render: () => <IconGrid size={24} />,
};

export const Large: Story = {
  name: "큰 아이콘 (32px)",
  render: () => <IconGrid size={32} />,
};

export const Small: Story = {
  name: "작은 아이콘 (16px)",
  render: () => <IconGrid size={16} />,
};

export const Colored: Story = {
  name: "컬러 (main-500)",
  render: () => <IconGrid size={24} color="var(--color-main-500)" />,
};

type SingleIconArgs = { type: IconKey; size: number; color?: string };

export const SingleIcon: StoryObj<SingleIconArgs> = {
  name: "단일 아이콘 — Controls",
  render: (args) => (
    <div className="flex items-center justify-center p-10">
      <Icon type={args.type as IconKey} size={args.size} color={args.color} />
    </div>
  ),
  args: {
    type: "circleCheck",
    size: 48,
    color: undefined,
  },
  argTypes: {
    type: {
      control: "select",
      options: ALL_ICONS.map((i) => i.key),
    },
    size: { control: { type: "range", min: 12, max: 64, step: 4 } },
    color: { control: "color" },
  },
};
