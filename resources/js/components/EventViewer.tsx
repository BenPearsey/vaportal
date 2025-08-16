/* ------------------------------------------------------------------------- */
/* EventViewer – reused by calendar & contacts                               */
/* ------------------------------------------------------------------------- */
import React from "react";
import dayjs from "dayjs";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface User { id: number; display_name?: string; name?: string; email?: string; }
interface Contact { id: number; firstname?: string; lastname?: string; company?: string; email?: string; }
interface Attachment { id: number; original_name: string; url?: string; }

interface EventViewerProps {
  event: {
    id?: number;
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
    attachments?: Attachment[];
  };
}

const fmt = (dt: string, allDay: boolean) =>
  dayjs(dt).format(allDay ? "MMM D YYYY" : "MMM D YYYY h:mm A");

const googleLink = (title:string, start:string, end:string, desc?:string|null, loc?:string|null) => {
  const enc = encodeURIComponent;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(title)}&dates=${dayjs(start).utc().format("YYYYMMDD[T]HHmmss[Z]")}/${dayjs(end).utc().format("YYYYMMDD[T]HHmmss[Z]")}&details=${enc(desc ?? "")}&location=${enc(loc ?? "")}`;
};

export default function EventViewer({ event }: EventViewerProps) {
  const {
    id,
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
    attachments = [],
  } = event;

  const participants = [
    ...user_participants.map((u) => u.display_name ?? u.name ?? u.email),
    ...contact_participants.map((c) =>
      (c.firstname || c.lastname)
        ? `${c.firstname ?? ""} ${c.lastname ?? ""}`.trim()
        : c.company ?? c.email ?? `Contact #${c.id}`
    ),
  ];

  const copyDetails = async () => {
    const lines = [
      `Event: ${title}`,
      `When:  ${fmt(start_datetime, all_day)}${!all_day ? " – " + fmt(end_datetime, all_day) : ""}`,
      location ? `Where: ${location}` : undefined,
      activity_type ? `Type:  ${activity_type}` : undefined,
      description ? `\n${description}` : undefined,
      participants.length ? `\nInvitees:\n- ${participants.join("\n- ")}` : undefined,
      `\nAdd to Google Calendar: ${googleLink(title, start_datetime, end_datetime, description ?? "", location ?? "")}`,
    ].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(lines);
    toast.success("Invite details copied");
  };

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
          <span className={`capitalize ${priority === "high" ? "text-red-600" : priority === "low" ? "text-green-600" : "text-yellow-600"}`}>
            {priority}
          </span>
        </p>

        {location && <p><b>Location:</b> {location}</p>}

        {reminder_minutes != null && (
          <p>
            <b>Reminder:</b>{" "}
            {reminder_minutes === 1440 ? "1 day" : `${reminder_minutes} min`}
          </p>
        )}

        {recurrence_rule && <p className="text-sm italic">Recurring event</p>}

        {!!attachments.length && (
          <>
            <Separator className="my-2" />
            <b>Attachments:</b>
            <ul className="ml-5 list-disc">
              {attachments.map(a => (
                <li key={a.id}>
                  {a.url
                    ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{a.original_name}</a>
                    : a.original_name}
                </li>
              ))}
            </ul>
          </>
        )}

        {participants.length > 0 && (
          <>
            <Separator className="my-2" />
            <b>Invitees:</b>
            <ul className="ml-5 list-disc">
              {participants.map((p) => (<li key={p}>{p}</li>))}
            </ul>
          </>
        )}

        <div className="pt-2">
          <Button size="sm" onClick={copyDetails}>Copy invite details</Button>
          <a
            className="ml-2 text-sm underline text-blue-600"
            target="_blank" rel="noopener noreferrer"
            href={googleLink(title, start_datetime, end_datetime, description ?? "", location ?? "")}
          >
            Add to Google Calendar
          </a>
        </div>
      </div>
    </>
  );
}
