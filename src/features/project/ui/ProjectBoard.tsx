"use client";

import ProjectBoardHeader from "./ProjectBoardHeader";
import PorjectBoardFilter from "./ProjectBoardFilter";
import ProjectBoardBody from "./ProjectBoardBody";
import { ProjectBoardProvider } from "@/providers/ProjectBoardProvider";
import { useProjectBoard } from "@/providers/ProjectBoardProvider";

export default function ProjectBoard() {
  return (
      <ProjectBoardProvider>
         <ProjectBoardContent />
      </ProjectBoardProvider>
  );
}

function ProjectBoardContent() {
   const { filter } = useProjectBoard();

   return (
      <>
         <ProjectBoardHeader />
         <PorjectBoardFilter />
         <ProjectBoardBody key={filter.view} />
      </>
   );
}
