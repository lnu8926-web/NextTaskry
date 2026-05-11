"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import Button from "@/components/ui/Button";
import { ProjectCreationModal } from "./ProjectCreationModal";

export default function ProjectBoardHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between mb-7">
        <SectionHeader
          title="프로젝트 목록"
          description="Taskry에서 프로젝트를 생성하고 관리합니다."
          className="mb-0!"
        />
        <div className="p-1 content-center">
          <Button btnType="basic" icon="plus" variant="primary" size={18} onClick={() => setOpen(true)}>
            새 프로젝트
          </Button>
        </div>
      </div>

      <ProjectCreationModal open={open} onOpenChange={setOpen} />
    </>
  );
}
