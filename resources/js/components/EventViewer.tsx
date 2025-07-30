/* ------------------------------------------------------------------------- */
/* EventViewer – reused by calendar & contacts                               */
/* ------------------------------------------------------------------------- */
import React from "react";
import dayjs from "dayjs";

import {
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* types that matter for read-only display */
interface User {
  id: number;
  display_name?: string;
  name?: string;
  email?: string;
}
interface Contact {
  id: number;
  firstname?: string;
  lastname?: string;
  company?: string;
  email?: string;
}
interface EventViewerProps {
  event: {
    title: string;
    description?: string | null;
    start_datetime: string;
    end_datetime: string;
    all_day: boolean;
    location?: string | null;
    priority?: "low" | "medium" | "high";
    status?: "scheduled" | "completed" | "canceled";
    activity_type?: string;
    reminder_minutes?: number | null;
    recurrence_rule?: string | null;
    user_participants?: User[];
    contact_participants?: Contact[];
  };
}

/* helpers */
const fmt = (dt: string, allDay: boolean) =>
  dayjs(dt).format(allDay ? "MMM D YYYY" : "MMM D YYYY h:mm A");

export default function EventViewer({ event }: EventViewerProps) {
  const {
    title,
    description,
    start_datetime,
    end_datetime,
    all_day,
    location,
    priority = "medium",
    status = "scheduled",
    activity_type,
    reminder_minutes,
    recurrence_rule,
    user_participants = [],
    contact_participants = [],
  } = event;

  const participants = [
    ...user_participants.map((u) => u.display_name ?? u.name ?? u.email),
    ...contact_participants.map((c) =>
      (c.firstname || c.lastname)
        ? `${c.firstname ?? ""} ${c.lastname ?? ""}`.trim()
        : c.company ?? c.email ?? `Contact #${c.id}`
    ),
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">{title}</DialogTitle>
      </DialogHeader>

      <div className="space-y-2 py-2">
        {description && <p className="whitespace-pre-line">{description}</p>}

        <p>
          <b>When:</b>{" "}
          {fmt(start_datetime, all_day)}{" "}
          {!all_day && <>– {fmt(end_datetime, all_day)}</>}
        </p>

        <p>
          <b>Status:</b>{" "}
          <Badge variant="secondary" className="capitalize">{status}</Badge>
        </p>

        {activity_type && (
          <p>
            <b>Type:</b>{" "}
            <Badge variant="outline" className="capitalize">
              {activity_type}
            </Badge>
          </p>
        )}

        <p>
          <b>Priority:</b>{" "}
          <span className={`capitalize text-${priority === "high" ? "red" : priority === "low" ? "green" : "yellow"}-600`}>
            {priority}
          </span>
        </p>

        {location && (
          <p>
            <b>Location:</b> {location}
          </p>
        )}

        {reminder_minutes != null && (
          <p>
            <b>Reminder:</b>{" "}
            {reminder_minutes === 1440
              ? "1 day"
              : `${reminder_minutes} min`}
          </p>
        )}

        {recurrence_rule && (
          <p className="text-sm italic">Recurring event</p>
        )}

        {participants.length > 0 && (
          <>
            <Separator className="my-2" />
            <b>Invitees:</b>
            <ul className="ml-5 list-disc">
              {participants.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
