import NavHeader from '@/components/NavHeader';
import ProjectsGrid from '@/components/projects/ProjectsGrid';

export default function ProyectosPage() {
  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <NavHeader />
      <div className="p-6">
        <ProjectsGrid />
      </div>
    </main>
  );
}
