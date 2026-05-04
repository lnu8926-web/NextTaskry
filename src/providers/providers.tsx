"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
    staleTime: 5 * 60 * 1000, // 5분 동안 데이터를 신선한 상태로 유지
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
