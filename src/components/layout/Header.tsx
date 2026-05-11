"use client";

import { useSession } from "next-auth/react";
import { showToast } from "@/lib/utils/toast";
import { Icon } from "@/components/shared/Icon";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Link from "next/link";
import ProfileModal from "@/app/(auth)/login/components/ProfileModal";
import Button from "@/components/ui/Button";

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoginModal = () => {
    if (!session) {
      showToast("로그인이 필요합니다.", "alert");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-card">
        <div className="w-full max-w-7xl px-8 mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex flex-col items-start leading-none gap-0.5">
            <span className="font-bold text-2xl text-main-500 dark:text-main-400 leading-none">Taskry</span>
            <span className="text-[13px] text-main-600 dark:text-main-300 leading-snug">프로젝트 관리 플랫폼</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              btnType="icon"
              icon="userCircle"
              size={20}
              className="w-[42px] h-[42px] rounded-[10px] border border-border"
              onClick={handleLoginModal}
            />

            <Link href="/notice">
              <Button
                btnType="icon"
                icon="speakerphone"
                size={20}
                className="w-[42px] h-[42px] rounded-[10px] border border-border"
              />
            </Link>

            {session?.user?.role === "admin" && (
              <Link href="/admin?tabs=users">
                <Button
                  btnType="icon"
                  icon="crown"
                  size={20}
                  className="w-[42px] h-[42px] rounded-[10px] border border-border"
                />
              </Link>
            )}

            <button
              className="w-[42px] h-[42px] rounded-[10px] border border-border bg-card flex items-center justify-center hover:bg-accent/10 transition-colors"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {mounted && resolvedTheme === "dark" ? (
                <Icon type="sun" size={20} className="text-yellow-300" />
              ) : (
                <Icon type="moon" size={20} className="text-main-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <ProfileModal
          isOpen={open}
          onClose={() => setOpen(false)}
          user={session?.user ?? null}
        />
      ) : null}
    </>
  );
}
