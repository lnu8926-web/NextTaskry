import { ProjectForm } from "@/features/project";

export default async function UpdateProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <ProjectForm projectId={id} />
    </div>
  );
}