'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronRight, Leaf } from 'lucide-react';
import { Salad } from '@/lib/salads';
import { SubscriptionDailyMenu } from '@/lib/siteSettings';

interface SubscriptionDay {
  date: string;
  options: [Salad, Salad];
}

interface WeeklySchedule {
  startDate: string;
  days: SubscriptionDay[];
}

interface HomeSubscriptionSectionProps {
  dailyMenus: SubscriptionDailyMenu[];
  salads: Salad[];
  isLoadingSalads: boolean;
  onContinue: (startDate: string, selections: Record<string, string>) => void;
}

const getSaladId = (salad: Salad) => salad.id || salad._id || salad.slug || salad.name;

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekDates = (monday: string) => {
  const [year, month, day] = monday.split('-').map(Number);
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(year, month - 1, day + index);
    return formatDate(date);
  });
};

export const HomeSubscriptionSection: React.FC<HomeSubscriptionSectionProps> = ({
  dailyMenus,
  salads,
  isLoadingSalads,
  onContinue,
}) => {
  const schedules = useMemo(() => {
    const today = formatDate(new Date());
    const menusByDate = new Map(
      dailyMenus
        .filter((menu) => menu.date >= today && Array.isArray(menu.saladIds))
        .map((menu) => [menu.date, menu])
    );
    return [...menusByDate.values()]
      .filter((menu) => new Date(`${menu.date}T00:00:00`).getDay() === 1)
      .map((menu) => {
        const dates = getWeekDates(menu.date);
        const days: Array<SubscriptionDay | null> = dates.map((date) => {
          const scheduledMenu = menusByDate.get(date);
          const options = (scheduledMenu?.saladIds || [])
            .map((id) => salads.find((salad) => getSaladId(salad) === id))
            .filter((salad): salad is Salad => Boolean(salad));
          if (options.length !== 2 || getSaladId(options[0]) === getSaladId(options[1])) return null;
          const dailyOptions: [Salad, Salad] = [options[0], options[1]];
          return { date, options: dailyOptions };
        });
        if (days.some((day) => day === null)) return null;
        return {
          startDate: menu.date,
          days: days.filter((day): day is SubscriptionDay => day !== null),
        };
      })
      .filter((schedule): schedule is WeeklySchedule => schedule !== null)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [dailyMenus, salads]);

  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedSalads, setSelectedSalads] = useState<Record<string, string>>({});
  const schedule = schedules.find((item) => item.startDate === selectedStartDate) || schedules[0];

  useEffect(() => {
    if (!schedules.some((item) => item.startDate === selectedStartDate)) {
      setSelectedStartDate(schedules[0]?.startDate || '');
      setSelectedSalads({});
    }
  }, [schedules, selectedStartDate]);

  const selectedCount = schedule
    ? schedule.days.filter((day) => Boolean(selectedSalads[day.date])).length
    : 0;
  const isComplete = Boolean(schedule && selectedCount === schedule.days.length);

  return (
    <section id="weekly-subscription" className="bg-[#f5faf7] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-900">
            <Leaf className="h-3.5 w-3.5" />
            Weekly salad subscription
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#123B2B] sm:text-4xl">
            Subscriptions
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose one of the two salads uploaded by our team for Monday through Saturday. Sunday is a holiday.
          </p>
        </div>

        {schedule ? (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <label className="block max-w-sm text-xs font-bold text-[#123B2B]">
                Choose your subscription week
                <select
                  value={schedule.startDate}
                  onChange={(event) => {
                    setSelectedStartDate(event.target.value);
                    setSelectedSalads({});
                  }}
                  className="mt-1.5 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm"
                >
                  {schedules.map((item) => (
                    <option key={item.startDate} value={item.startDate}>
                      Week starting {new Date(`${item.startDate}T00:00:00`).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </option>
                  ))}
                </select>
              </label>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CalendarDays className="h-4 w-4" />
                {selectedCount} of 6 days selected
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {schedule.days.map((day) => {
                const date = new Date(`${day.date}T00:00:00`);
                return (
                  <article key={day.date} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#123B2B]">
                          {date.toLocaleDateString('en-IN', { weekday: 'long' })}
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {selectedSalads[day.date] && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {day.options.map((salad, index) => {
                        const saladId = getSaladId(salad);
                        const selected = selectedSalads[day.date] === saladId;
                        return (
                          <button
                            key={saladId}
                            type="button"
                            onClick={() => setSelectedSalads((current) => ({ ...current, [day.date]: saladId }))}
                            aria-pressed={selected}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-colors ${
                              selected
                                ? 'border-[#20493c] bg-emerald-50'
                                : 'border-gray-100 bg-gray-50 hover:border-emerald-200'
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-[#20493c]">
                                {index + 1}
                              </span>
                              <span className="truncate text-xs font-bold text-[#20493c]">{salad.name}</span>
                            </span>
                            {selected && <Check className="h-4 w-4 shrink-0 text-[#20493c]" />}
                          </button>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-900 md:col-span-2 xl:col-span-3">
                <span aria-hidden="true">☀️</span>
                Sunday · Holiday — no delivery
              </div>
            </div>

            <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-[#123B2B] p-4 text-center text-white sm:flex-row sm:px-6 sm:text-left">
              <p className="text-xs font-semibold text-white/85">
                {isComplete ? 'Your weekly salad choices are ready.' : 'Select one salad for each of the six delivery days to continue.'}
              </p>
              <button
                type="button"
                disabled={!isComplete}
                onClick={() => onContinue(schedule.startDate, selectedSalads)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fbce45] px-5 py-3 text-xs font-black text-[#123B2B] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue with weekly plan
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-center">
            <p className="text-sm font-bold text-amber-900">
              {isLoadingSalads
                ? 'Loading the weekly salad schedule...'
                : 'The next complete Monday–Saturday salad schedule is not available yet.'}
            </p>
            <p className="mt-1 text-xs text-amber-800">
              {isLoadingSalads
                ? 'Please wait while we load the salads.'
                : 'Please check back after Greesal publishes two choices for each delivery day.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
