// resources/js/utils/recurrenceUtils.ts
import { RRule } from "rrule";
import dayjs from "dayjs";
import { WizardState } from "@/components/RecurrenceWizard";

export function buildRRuleString(state: WizardState, dtStart: string): string {
  const opts: Partial<RRule.Options> = {
    freq: RRule[state.frequency],
    interval: state.interval,
  };

  if (state.frequency === "WEEKLY") {
    opts.byweekday = state.byWeekDays.map((d) => RRule[d]);
  }

  if (state.frequency === "MONTHLY") {
    if (state.monthlyMode === "BY_MONTH_DAY") {
      opts.bymonthday = [state.monthDay];
    } else {
      opts.byweekday = [
        RRule[dayjs(dtStart).format("dd").toUpperCase()].nth(state.weekOfMonth),
      ];
    }
  }

  // ends
  if (state.ends === "after" && state.count) opts.count = state.count;
  if (state.ends === "on" && state.until)
    opts.until = dayjs(state.until).endOf("day").toDate();

  return new RRule({ dtstart: new Date(dtStart), ...opts }).toString();
}

export function parseRRule(rrule: string): WizardState {
  const rule = RRule.fromString(rrule);
  const freq = RRule.FREQUENCIES[rule.options.freq].toUpperCase() as
    | "DAILY"
    | "WEEKLY"
    | "MONTHLY";

  const state: Partial<WizardState> = {
    frequency: freq,
    interval: rule.options.interval ?? 1,
    ends: rule.options.count ? "after" : rule.options.until ? "on" : "never",
    count: rule.options.count ?? 1,
    until: rule.options.until
      ? dayjs(rule.options.until).format("YYYY-MM-DD")
      : undefined,
  };

  if (freq === "WEEKLY") {
    state.byWeekDays = (rule.options.byweekday ?? []).map((w) => w.toString().slice(0,2).toUpperCase());
  }

  if (freq === "MONTHLY") {
    if (rule.options.bymonthday) {
      state.monthlyMode = "BY_MONTH_DAY";
      state.monthDay = rule.options.bymonthday[0];
    } else if (rule.options.byweekday) {
      state.monthlyMode = "BY_WEEK_DAY";
      const first = rule.options.byweekday[0];
      state.weekOfMonth = first.nth ?? 1;
    }
  }

  return state as WizardState;
}
