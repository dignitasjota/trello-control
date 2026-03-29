import Board from '@/components/Board';
import NavHeader from '@/components/NavHeader';

export default function KanbanPage() {
  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <NavHeader />
      <div className="p-6">
        <Board />
      </div>
    </main>
  );
}
