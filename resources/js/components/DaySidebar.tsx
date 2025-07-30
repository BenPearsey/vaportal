/* ------------------------------------------------------------------------- */
/* DaySidebar.tsx – compact agenda + mini-month picker                       */
/* ------------------------------------------------------------------------- */
import React from "react";
import dayjs from "dayjs";

/* ────────────────────────────────────────────────────────── */
interface AgendaItem {
  id: string | number;                  // MUST be unique
  title: string;
  time: string;                         // “4:30 PM”
  completed: boolean;  
}

interface Props {
  selected: Date | null;
  onSelectDate: (d: Date) => void;
  agenda: AgendaItem[];
}

/* ────────────────────────────────────────────────────────── */
export default function DaySidebar({ selected, onSelectDate, agenda }: Props) {
  /* build a six-row, seven-column matrix of dayjs objects */
  const monthStart = dayjs(selected ?? new Date()).startOf("month");
  const weeks = Array.from({ length: 6 }, (_w, i) =>
    Array.from({ length: 7 }, (_d, j) =>
      monthStart.startOf("week").add(i * 7 + j, "day")
    )
  );

  return (
    <aside className="w-64 shrink-0 rounded-lg border p-3">
      {/* ───── Month picker header ───── */}
      <header className="flex items-center justify-between mb-2">
        <button
          className="px-1 text-sm"
          onClick={() =>
            onSelectDate(dayjs(selected!).subtract(1, "month").toDate())
          }
        >
          ‹
        </button>
        <h2 className="text-sm font-semibold">
          {dayjs(selected!).format("MMMM YYYY")}
        </h2>
        <button
          className="px-1 text-sm"
          onClick={() =>
            onSelectDate(dayjs(selected!).add(1, "month").toDate())
          }
        >
          ›
        </button>
      </header>

      {/* ───── Tiny month grid ───── */}
      <table className="w-full text-center text-xs select-none">
        <thead>
          <tr>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
              /* UNIQUE key for each column */
              <th key={`hdr-${idx}`} className="pb-1 font-medium">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((w, row) => (
            <tr key={`row-${row}`}>
              {w.map((d) => {
                const isCurrent = d.isSame(selected, "day");
                const inMonth = d.isSame(monthStart, "month");
                return (
                  <td
                    key={d.valueOf()}
                    className={`cursor-pointer rounded ${
                      isCurrent
                        ? "bg-primary text-white"
                        : inMonth
                        ? ""
                        : "text-gray-400"
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

       {/* ───── Agenda list ───── */}
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-semibold">
          {dayjs(selected!).format("MMMM D, YYYY")}
        </h3>

        {agenda.length === 0 && (
          <p className="text-xs text-muted-foreground">No events</p>
        )}

        {agenda.map((e) => (
          <div
            key={e.id}
            className={`flex items-center gap-2 text-xs ${
              e.completed ? "line-through opacity-60" : ""
            }`}
          >
            <span className="text-muted-foreground">{e.time}</span>
            <span>{e.title}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}