/* ------------------------------------------------------------------------- */
/* DaySidebar.tsx – compact agenda + mini-month picker                       */
/* ------------------------------------------------------------------------- */
import React from "react";
import dayjs from "dayjs";

interface AgendaItem {
  id: string | number;
  title: string;
  time: string;
  completed: boolean;
}

interface Props {
  selected: Date | null;
  onSelectDate: (d: Date) => void;
  agenda: AgendaItem[];
  onOpenEvent?: (id: string | number) => void; // NEW
}

export default function DaySidebar({ selected, onSelectDate, agenda, onOpenEvent }: Props) {
  const monthStart = dayjs(selected ?? new Date()).startOf("month");
  const weeks = Array.from({ length: 6 }, (_w, i) =>
    Array.from({ length: 7 }, (_d, j) =>
      monthStart.startOf("week").add(i * 7 + j, "day")
    )
  );

  return (
    <aside className="w-64 shrink-0 rounded-lg border p-3">
      <header className="flex items-center justify-between mb-2">
        <button className="px-1 text-sm" onClick={() => onSelectDate(dayjs(selected!).subtract(1, "month").toDate())}>‹</button>
        <h2 className="text-sm font-semibold">{dayjs(selected!).format("MMMM YYYY")}</h2>
        <button className="px-1 text-sm" onClick={() => onSelectDate(dayjs(selected!).add(1, "month").toDate())}>›</button>
      </header>

      <table className="w-full text-center text-xs select-none">
        <thead>
          <tr>{["S","M","T","W","T","F","S"].map((d,i)=><th key={`hdr-${i}`} className="pb-1 font-medium">{d}</th>)}</tr>
        </thead>
        <tbody>
          {weeks.map((w, row) => (
            <tr key={`row-${row}`}>
              {w.map((d) => {
                const isCurrent = d.isSame(selected, "day");
                const inMonth  = d.isSame(monthStart, "month");
                return (
                  <td
                    key={d.valueOf()}
                    className={`cursor-pointer rounded ${
                      isCurrent ? "bg-primary text-white" : inMonth ? "" : "text-gray-400"
                    } hover:bg-primary/20`}
                    onClick={() => onSelectDate(d.toDate())}
                  >
                    {d.date()}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-semibold">{dayjs(selected!).format("MMMM D, YYYY")}</h3>

        {agenda.length === 0 && <p className="text-xs text-muted-foreground">No events</p>}

        {agenda.map(e => (
          <button
            key={e.id}
            onClick={() => onOpenEvent?.(e.id)}
            className={`flex w-full items-center gap-2 text-left text-xs rounded px-1 py-0.5 hover:bg-muted ${
              e.completed ? "line-through opacity-60" : ""
            }`}
          >
            <span className="text-muted-foreground shrink-0">{e.time}</span>
            <span className="truncate">{e.title}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
