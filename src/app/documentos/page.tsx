import NavHeader from '@/components/NavHeader';
import DocumentsView from '@/components/documents/DocumentsView';

export default function DocumentosPage() {
  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <NavHeader />
      <div className="p-6 max-w-6xl mx-auto">
        <DocumentsView />
      </div>
    </main>
  );
}
