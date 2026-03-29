import NavHeader from '@/components/NavHeader';
import SettingsView from '@/components/SettingsView';

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-col h-full">
      <NavHeader />
      <main className="flex-1 px-6 py-6 overflow-y-auto">
        <h1 className="text-xl font-bold text-zinc-100 mb-6">Configuracion</h1>
        <SettingsView />
      </main>
    </div>
  );
}
