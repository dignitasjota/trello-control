import NavHeader from '@/components/NavHeader';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <NavHeader />
      <div className="p-6 max-w-6xl mx-auto">
        <Dashboard />
      </div>
    </main>
  );
}
