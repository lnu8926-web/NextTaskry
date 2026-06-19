import type { Meta, StoryObj } from "@storybook/react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const meta: Meta<typeof LoadingSpinner> = {
  title: "UI/LoadingSpinner",
  component: LoadingSpinner,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {};
