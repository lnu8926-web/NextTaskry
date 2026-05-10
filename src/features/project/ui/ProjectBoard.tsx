import ProjectBoardHeader from "@/features/project/ui/ProjectBoardHeader";
import PorjectBoardFilter from "./ProjectBoardFilter";
import ProjectBoardBody from "@/features/project/ui/ProjectBoardBody";
import { ProjectBoardProvider } from "@/providers/ProjectBoardProvider";

export default function ProjectBoard() {
  return (
     <ProjectBoardProvider>
        <ProjectBoardHeader />
        <PorjectBoardFilter />
        <ProjectBoardBody />
     </ProjectBoardProvider>
  );
}
