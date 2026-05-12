"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { ProjectCreationModal } from "./ProjectCreationModal";

export default function ProjectBoardHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold text-foreground">프로젝트</h2>
        <Button btnType="basic" icon="plus" variant="primary" size={16} onClick={() => setOpen(true)}>
          새 프로젝트
        </Button>
      </div>

      <ProjectCreationModal open={open} onOpenChange={setOpen} />
    </>
  );
}
