import { ProjectForm } from "@/features/project";
import PageContainer from "@/components/shared/PageContainer";

export default async function UpdateProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageContainer>
      <ProjectForm projectId={id} />
    </PageContainer>
  );
}
