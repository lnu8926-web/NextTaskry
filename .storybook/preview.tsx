import type { Preview, Decorator } from "@storybook/react";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import "../src/app/globals.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

// Storybook backgrounds 어댑터가 선택한 배경값을 기반으로
// <html>에 dark 클래스를 동기화하고, next-themes + react-hot-toast를 마운트합니다.
const withProviders: Decorator = (Story, context) => {
  const background = context.globals?.backgrounds?.value;
  const isDark = background === "#0f172a";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        forcedTheme={isDark ? "dark" : "light"}
        disableTransitionOnChange
      >
        <Toaster position="bottom-right" />
        <Story />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const preview: Preview = {
  decorators: [withProviders],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#0f172a" },
      ],
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
