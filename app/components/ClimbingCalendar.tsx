"use client";

import { useMemo, useState } from "react";
import calendarData from "app/data/climbing-calendar.json";

const days: Record<string, number> = calendarData.days;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const SIDEBAR_LABELS: Record<number, string> = {
  1: "Mon",
  3: "Wed",
  5: "Fri",
};

function keyOf(epochMs: number): string {
  const d = new Date(epochMs);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function ClimbingCalendar() {
  const years = useMemo(() => {
    const allKeys = Object.keys(days);
    if (allKeys.length === 0) return [];
    const ys = allKeys.map((k) => parseInt(k.slice(0, 4), 10));
    return Array.from(new Set(ys)).sort((a, b) => b - a);
  }, []);

  const [year, setYear] = useState(years[0] ?? new Date().getUTCFullYear());

  const activeDays = useMemo(
    () => Object.keys(days).filter((k) => k.startsWith(`${year}-`)).length,
    [year],
  );

  if (years.length === 0) return null;

  const DAY_MS = 86400000;
  const jan1 = Date.UTC(year, 0, 1);
  const gridStart = jan1 - new Date(jan1).getUTCDay() * DAY_MS;
  const dec31 = Date.UTC(year, 11, 31);
  const colCount = Math.ceil((dec31 - gridStart + 1) / (7 * DAY_MS));

  const columns: boolean[][] = [];
  for (let i = 0; i < colCount; i++) {
    const col: boolean[] = [];
    for (let r = 0; r < 7; r++) {
      const epoch = gridStart + (i * 7 + r) * DAY_MS;
      const inYear = new Date(epoch).getUTCFullYear() === year;
      col.push(inYear && days[keyOf(epoch)] > 0);
    }
    columns.push(col);
  }

  const labels: (string | null)[] = [];
  let prevMonth: number | null = null;
  for (let i = 0; i < columns.length; i++) {
    const firstDate = new Date(gridStart + i * 7 * DAY_MS);
    if (firstDate.getUTCFullYear() !== year) {
      labels.push(null);
      continue;
    }
    const m = firstDate.getUTCMonth();
    if (m !== prevMonth) {
      labels.push(MONTHS[m]);
      prevMonth = m;
    } else {
      labels.push(null);
    }
  }

  return (
    <div className="my-6">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-sm text-neutral-600">
          <span className="font-semibold text-neutral-900">{activeDays}</span>{" "}
          climbing days in {year}
        </span>
        <div className="flex gap-1">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              aria-pressed={y === year}
              className={
                y === year
                  ? "rounded px-1.5 py-0.5 text-sm font-semibold text-sap-green-800 bg-sap-green-100"
                  : "rounded px-1.5 py-0.5 text-sm text-neutral-500 hover:text-neutral-900"
              }
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div dir="ltr">
        <div className="flex flex-col gap-1">
          <div className="flex gap-[2px]">
            <div className="w-7 shrink-0" />
            {labels.map((label, i) => (
              <span
                key={i}
                className="flex-1 whitespace-nowrap text-[10px] font-medium leading-[12px] text-neutral-400"
              >
                {label ?? ""}
              </span>
            ))}
          </div>
          <div className="flex gap-[2px]">
            <div className="flex w-7 shrink-0 flex-col items-end gap-[2px] pr-1 text-[10px] font-medium leading-[13px] text-neutral-400">
              {[0, 1, 2, 3, 4, 5, 6].map((r) => (
                <span key={r} className="h-[13px]">
                  {SIDEBAR_LABELS[r] ?? ""}
                </span>
              ))}
            </div>
            {columns.map((col, i) => (
              <div key={i} className="flex flex-1 flex-col gap-[2px]">
                {col.map((active, r) => {
                  const epoch = gridStart + (i * 7 + r) * 86400000;
                  return (
                    <div
                      key={r}
                      title={
                        active
                          ? `Climbing on ${keyOf(epoch)}`
                          : keyOf(epoch)
                      }
                      className={`h-[13px] w-full rounded-[1px] ${
                        active ? "bg-sap-green-500" : "bg-neutral-100"
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}