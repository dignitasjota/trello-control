import NavHeader from '@/components/NavHeader';
import ProjectDetail from '@/components/projects/ProjectDetail';

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <NavHeader />
      <div className="p-6 max-w-7xl mx-auto">
        <ProjectDetail slug={slug} />
      </div>
    </main>
  );
}
