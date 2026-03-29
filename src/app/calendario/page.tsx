import NavHeader from '@/components/NavHeader';
import CalendarView from '@/components/calendar/CalendarView';

export default function CalendarioPage() {
  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <NavHeader />
      <div className="p-6">
        <CalendarView />
      </div>
    </main>
  );
}
