"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { ProjectCreationModal } from "./ProjectCreationModal";

export default function ProjectBoardHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">프로젝트 목록</h2>
          <p className="text-sm text-main-600 dark:text-main-300 mt-0.5">
            Taskry에서 프로젝트를 생성하고 관리합니다.
          </p>
        </div>
        <Button btnType="basic" icon="plus" variant="primary" size={16} onClick={() => setOpen(true)}>
          새 프로젝트
        </Button>
      </div>

      <ProjectCreationModal open={open} onOpenChange={setOpen} />
    </>
  );
}
