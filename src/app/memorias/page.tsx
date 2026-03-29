import NavHeader from '@/components/NavHeader';
import MemoriesView from '@/components/memories/MemoriesView';

export default function MemoriasPage() {
  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <NavHeader />
      <div className="p-6 max-w-6xl mx-auto">
        <MemoriesView />
      </div>
    </main>
  );
}
