import React, { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dayjs from "dayjs";
import { buildRRuleString, parseRRule } from "@/utils/recurrenceUtils";

/* ────────────────────────────────────────────────────────── */

export type WizardState = {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  interval: number;              // every N units
  byWeekDays: string[];          // ["MO","WE"]
  monthlyMode: "BY_MONTH_DAY" | "BY_WEEK_DAY";
  monthDay: number;              // 1–31
  weekOfMonth: number;           // 1–5 (or -1 for last)
  ends: "never" | "after" | "on";
  count?: number;                // after N occurrences
  until?: string;                // yyyy-MM-DD
};

interface Props {
  open: boolean;
  dtStart: string;               // ISO start datetime
  value: string | null;          // existing RRULE (edit)
  onChange: (rrule: string | null) => void;
}

/* ────────────────────────────────────────────────────────── */

export default function RecurrenceWizard({
  open,
  dtStart,
  value,
  onChange,
}: Props) {
  /* initialise state */
  const [state, setState] = React.useState<WizardState>(() =>
    value
      ? parseRRule(value)
      : {
          frequency: "DAILY",
          interval: 1,
          byWeekDays: ["MO"],
          monthlyMode: "BY_MONTH_DAY",
          monthDay: dayjs(dtStart).date(),
          weekOfMonth: 1,
          ends: "never",
        }
  );

  /* rebuild rule on change */
  useEffect(() => {
    if (!dtStart || Number.isNaN(Date.parse(dtStart))) return;
    const rrule = buildRRuleString(state, dtStart);
    if (rrule !== value) onChange(rrule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, dtStart]);

  /* helper */
  const set = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  /* ────────────────────────────────────────────────────────── */

  return (
    <div className={open ? "space-y-4" : "hidden"}>
      <Label className="font-semibold">Recurrence</Label>

      <Tabs
        defaultValue={state.frequency}
        onValueChange={(v) => set("frequency", v as any)}
      >
        <TabsList>
          <TabsTrigger value="DAILY">Daily</TabsTrigger>
          <TabsTrigger value="WEEKLY">Weekly</TabsTrigger>
          <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
        </TabsList>

        {/* DAILY */}
        <TabsContent value="DAILY" className="pt-4 space-y-2">
          <div className="flex items-center gap-2">
            Every
            <Input
              type="number"
              className="w-20"
              value={state.interval}
              min={1}
              onChange={(e) => set("interval", +e.target.value)}
            />
            day(s)
          </div>
        </TabsContent>

        {/* WEEKLY */}
        <TabsContent value="WEEKLY" className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            Every
            <Input
              type="number"
              className="w-20"
              value={state.interval}
              min={1}
              onChange={(e) => set("interval", +e.target.value)}
            />
            week(s) on:
          </div>

          <div className="flex gap-2 flex-wrap">
            {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((d) => (
              <Checkbox
                key={d}
                checked={state.byWeekDays.includes(d)}
                onCheckedChange={(c) =>
                  set(
                    "byWeekDays",
                    c
                      ? [...state.byWeekDays, d]
                      : state.byWeekDays.filter((x) => x !== d)
                  )
                }
                label={d}
              />
            ))}
          </div>
        </TabsContent>

        {/* MONTHLY */}
        <TabsContent value="MONTHLY" className="pt-4 space-y-4">
          <div className="flex items-center gap-2">
            Every
            <Input
              type="number"
              className="w-20"
              value={state.interval}
              min={1}
              onChange={(e) => set("interval", +e.target.value)}
            />
            month(s) on:
          </div>

          {/* mode selector (radio buttons) */}
          <div className="space-y-1">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="monthlyMode"
                checked={state.monthlyMode === "BY_MONTH_DAY"}
                onChange={() => set("monthlyMode", "BY_MONTH_DAY")}
              />
              Day {state.monthDay}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="monthlyMode"
                checked={state.monthlyMode === "BY_WEEK_DAY"}
                onChange={() => set("monthlyMode", "BY_WEEK_DAY")}
              />
              {ordinal(state.weekOfMonth)} {dayjs(dtStart).format("dddd")}
            </label>
          </div>

          {state.monthlyMode === "BY_MONTH_DAY" && (
            <Input
              type="number"
              className="w-24"
              min={1}
              max={31}
              value={state.monthDay}
              onChange={(e) => set("monthDay", +e.target.value)}
            />
          )}
          {state.monthlyMode === "BY_WEEK_DAY" && (
            <Input
              type="number"
              className="w-24"
              min={-1}
              max={5}
              value={state.weekOfMonth}
              onChange={(e) => set("weekOfMonth", +e.target.value)}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Ends */}
      <Label className="font-semibold pt-2">Ends</Label>
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="ends"
            checked={state.ends === "never"}
            onChange={() => set("ends", "never")}
          />
          Never
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="ends"
            checked={state.ends === "after"}
            onChange={() => set("ends", "after")}
          />
          After&nbsp;
          <Input
            type="number"
            disabled={state.ends !== "after"}
            className="w-24"
            value={state.count ?? 1}
            min={1}
            onChange={(e) => set("count", +e.target.value)}
          />
          occurrence(s)
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="ends"
            checked={state.ends === "on"}
            onChange={() => set("ends", "on")}
          />
          On&nbsp;
          <Input
            type="date"
            disabled={state.ends !== "on"}
            value={state.until ?? ""}
            onChange={(e) => set("until", e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

/* util */
const ord = ["zeroth", "first", "second", "third", "fourth", "fifth"];
const ordinal = (n: number) => (n === -1 ? "last" : ord[n] ?? `${n}th`);
