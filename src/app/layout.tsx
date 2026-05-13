import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import Provider from "@/providers/providers";
import Toaster from "@/components/ui/Toaster";
import AuthProviders from "@/providers/AuthProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taskry",
  description: "팀 프로젝트 관리 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
        suppressHydrationWarning={true}
      >
        <Provider>
          <AuthProviders>
            <div className="h-full flex flex-col">
              <Header />
              <div className="flex-1 min-w-0 overflow-auto scrollbar-gutter-stable">{children}</div>
              <Toaster />
            </div>
          </AuthProviders>
        </Provider>
      </body>
    </html>
  );
}
