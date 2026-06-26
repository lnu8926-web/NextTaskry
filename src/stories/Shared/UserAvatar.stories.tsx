import type { Meta, StoryObj } from "@storybook/react";
import {
  UserAvatar,
  UserAvatarSmall,
  UserAvatarMedium,
  UserAvatarLarge,
} from "@/components/shared/UserAvatar";

const meta: Meta<typeof UserAvatar> = {
  title: "Shared/UserAvatar",
  component: UserAvatar,
  tags: ["autodocs"],
  argTypes: {
    size: { control: { type: "number", min: 16, max: 128, step: 8 } },
    profileImage: { control: "text" },
    userName: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const Default: Story = {
  args: {
    userName: "김개발",
    size: 40,
  },
};

export const WithImage: Story = {
  name: "이미지 있음",
  args: {
    userName: "김개발",
    profileImage: "https://avatars.githubusercontent.com/u/1?v=4",
    size: 40,
  },
};

export const InitialFallback: Story = {
  name: "이미지 없음 (이니셜 폴백)",
  args: {
    userName: "이디자인",
    size: 40,
  },
};

export const SizeSmall: Story = {
  name: "Small (24px)",
  render: () => <UserAvatarSmall userName="소" />,
};

export const SizeMedium: Story = {
  name: "Medium (32px)",
  render: () => <UserAvatarMedium userName="중" />,
};

export const SizeLarge: Story = {
  name: "Large (48px)",
  render: () => <UserAvatarLarge userName="대" />,
};

export const SizeVariants: Story = {
  name: "크기별 비교",
  render: () => (
    <div className="flex items-end gap-4 p-4">
      <div className="flex flex-col items-center gap-1">
        <UserAvatarSmall userName="소" />
        <span className="text-xs text-muted-foreground">24px</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <UserAvatarMedium userName="중" />
        <span className="text-xs text-muted-foreground">32px</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <UserAvatarLarge userName="대" />
        <span className="text-xs text-muted-foreground">48px</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <UserAvatar userName="특" size={64} />
        <span className="text-xs text-muted-foreground">64px</span>
      </div>
    </div>
  ),
};

export const AvatarGroup: Story = {
  name: "아바타 그룹",
  render: () => (
    <div className="flex items-center p-4">
      {["김개발", "이디자인", "박기획", "최마케팅"].map((name, i) => (
        <div
          key={name}
          style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 4 - i, position: "relative" }}
          title={name}
        >
          <UserAvatar userName={name} size={32} />
        </div>
      ))}
      <span className="ml-3 text-sm text-muted-foreground">+2명</span>
    </div>
  ),
};
