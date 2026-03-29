'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ScheduledTask, Frequency, ScheduledExecution } from '@/lib/types';
import { FREQUENCY_COLORS } from '@/lib/types';
import { taskOccursOnDate } from '@/lib/schedule-utils';
import ScheduledTaskModal from './ScheduledTaskModal';
import DayDetail from './DayDetail';

type ViewMode = 'month' | 'week';

const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  // Monday = 0
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }
  return days;
}

function getWeekDays(baseDate: Date) {
  const d = new Date(baseDate);
  let dayOfWeek = d.getDay() - 1;
  if (dayOfWeek < 0) dayOfWeek = 6;
  const monday = new Date(d);
  monday.setDate(d.getDate() - dayOfWeek);

  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push({ date: day, isCurrentMonth: true });
  }
  return days;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarView() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [executionsByDate, setExecutionsByDate] = useState<Record<string, Set<string>>>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalTask, setModalTask] = useState<Partial<ScheduledTask> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/scheduled-tasks');
    const data = await res.json();
    setTasks(data);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Fetch executions for visible date range
  useEffect(() => {
    async function loadExecutions() {
      const days = viewMode === 'month'
        ? getMonthDays(currentDate.getFullYear(), currentDate.getMonth())
        : getWeekDays(currentDate);

      const startDate = dateKey(days[0].date);
      const endDate = dateKey(days[days.length - 1].date);

      const map: Record<string, Set<string>> = {};

      for (const task of tasks) {
        const res = await fetch(`/api/scheduled-tasks/${task.id}/executions`);
        const execs: ScheduledExecution[] = await res.json();

        for (const exec of execs) {
          const dk = exec.executed_at.split(' ')[0];
          if (dk >= startDate && dk <= endDate) {
            if (!map[dk]) map[dk] = new Set();
            map[dk].add(task.id);
          }
        }
      }

      setExecutionsByDate(map);
    }

    if (tasks.length > 0) {
      loadExecutions();
    }
  }, [tasks, currentDate, viewMode]);

  const navigatePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d);
  };

  const navigateNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleSave = async (data: Partial<ScheduledTask>) => {
    if (data.id) {
      await fetch(`/api/scheduled-tasks/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/scheduled-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setModalOpen(false);
    setModalTask(null);
    fetchTasks();
  };

  const days = viewMode === 'month'
    ? getMonthDays(currentDate.getFullYear(), currentDate.getMonth())
    : getWeekDays(currentDate);

  const today = new Date();
  const todayKey = dateKey(today);

  const monthLabel = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  function getTasksForDay(date: Date) {
    return tasks.filter(t =>
      t.active && taskOccursOnDate(t.frequency as Frequency, t.created_at, t.cron_expression, date)
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={navigatePrev} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={navigateNext} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <h2 className="text-lg font-semibold text-zinc-100 capitalize">{monthLabel}</h2>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'month' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'week' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Semana
            </button>
          </div>
          <button
            onClick={() => { setModalTask({}); setModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva tarea
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(name => (
          <div key={name} className="text-center text-xs font-medium text-zinc-500 py-2">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`grid grid-cols-7 flex-1 border border-zinc-800 rounded-xl overflow-hidden ${
        viewMode === 'week' ? 'grid-rows-1' : 'grid-rows-6'
      }`}>
        {days.map((day, i) => {
          const dk = dateKey(day.date);
          const isToday = dk === todayKey;
          const dayTasks = getTasksForDay(day.date);
          const executedToday = executionsByDate[dk] || new Set();

          return (
            <div
              key={i}
              onClick={() => setSelectedDate(day.date)}
              className={`
                border-r border-b border-zinc-800 p-1.5 cursor-pointer transition-colors overflow-hidden
                ${!day.isCurrentMonth ? 'bg-zinc-950/50' : 'bg-zinc-900/30 hover:bg-zinc-800/30'}
                ${isToday ? 'ring-1 ring-inset ring-blue-500/40' : ''}
                last:border-r-0
              `}
            >
              <div className={`text-xs font-medium mb-1 ${
                isToday ? 'text-blue-400' : day.isCurrentMonth ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                {day.date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, viewMode === 'week' ? 10 : 3).map(task => {
                  const executed = executedToday.has(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`text-[10px] px-1 py-0.5 rounded truncate ${
                        executed
                          ? 'bg-green-500/10 text-green-400 line-through'
                          : FREQUENCY_COLORS[task.frequency as Frequency]
                      }`}
                    >
                      {task.scheduled_time.slice(0, 5)} {task.name}
                    </div>
                  );
                })}
                {dayTasks.length > (viewMode === 'week' ? 10 : 3) && (
                  <div className="text-[10px] text-zinc-500 px-1">
                    +{dayTasks.length - (viewMode === 'week' ? 10 : 3)} mas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side panel */}
      {selectedDate && (
        <DayDetail
          date={selectedDate}
          tasks={tasks}
          onClose={() => setSelectedDate(null)}
          onEdit={(task) => {
            setModalTask(task);
            setModalOpen(true);
          }}
        />
      )}

      {/* Modal */}
      {modalOpen && (
        <ScheduledTaskModal
          task={modalTask}
          onClose={() => { setModalOpen(false); setModalTask(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
