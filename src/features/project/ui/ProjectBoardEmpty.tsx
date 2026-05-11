"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { ProjectCreationModal } from "./ProjectCreationModal";

export default function ProjectBoardEmpty() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
        <div className="w-24 h-24 bg-main-500/10 dark:bg-main-400/10 rounded-full flex items-center justify-center shrink-0">
          <FolderPlus className="w-12 h-12 text-main-500 dark:text-main-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            프로젝트를 시작해볼까요?
          </h2>
          <p className="text-base text-main-600 dark:text-main-300">
            새로운 프로젝트를 만들고 체계적으로 관리하세요
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-main-500 dark:bg-main-400 text-white font-medium px-8 h-12 rounded-[10px] hover:bg-main-600 dark:hover:bg-main-500 transition-colors"
        >
          첫 프로젝트 만들기
        </button>
      </div>
      <ProjectCreationModal open={open} onOpenChange={setOpen} />
    </>
  );
}
