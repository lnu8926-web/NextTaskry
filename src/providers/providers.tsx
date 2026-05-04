"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { showToast } from "@/lib/utils/toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
    mutations: {
      onError: (error) => {
        const message = error instanceof Error ? error.message : "오류가 발생했습니다.";
        showToast(message, "error");
      },
    },
  },
});

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem={false}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
