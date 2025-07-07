// resources/js/Pages/AdminCalendarPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout-admin";
import FullCalendar, {
  EventClickArg,
  EventDropArg,
  EventResizeDoneArg,
  EventInput,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

type CalendarEvent = {
  id?: number | string;
  title?: string;
  description?: string | null;
  start?: string;
  end?: string;
  all_day?: boolean;
};

export default function AdminCalendarPage() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<CalendarEvent>({});
  const [editingEventId, setEditingEventId] = useState<number | string | null>(
    null
  );

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/admin/events");
      const parsed = data.map((e: any) => ({
        id: e.id,
        title: e.title,
        start: e.start_datetime,
        end: e.end_datetime,
        allDay: e.all_day,
        description: e.description,
      }));
      setEvents(parsed);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setFormData({});
    setEditingEventId(null);
  };

  const handleFormChange = (field: keyof CalendarEvent, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------- CREATE ---------- */
  const handleNewSubmit = async () => {
    try {
      await axios.post("/admin/events", {
        title: formData.title,
        description: formData.description,
        start_datetime: formData.start,
        end_datetime: formData.end,
        all_day: formData.all_day ?? false,
      });
      toast.success("Event created");
      setIsNewOpen(false);
      resetForm();
      fetchEvents();
   } catch (error: any) {
  if (axios.isAxiosError(error) && error.response?.status === 422) {
    const first = Object.values(error.response.data.errors)[0] as string[];
    toast.error(first?.[0] ?? "Validation error");
  } else {
    toast.error("Failed to create event");
  }
  console.error(error.response ?? error);
}

  };

  /* ---------- UPDATE ---------- */
  const handleEditSubmit = async () => {
    if (!editingEventId) return;
    try {
      await axios.put(`/admin/events/${editingEventId}`, {
        title: formData.title,
        description: formData.description,
        start_datetime: formData.start,
        end_datetime: formData.end,
        all_day: formData.all_day ?? false,
      });
      toast.success("Event updated");
      setIsEditOpen(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error(error.response?.data || error);
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const firstErr = Object.values(error.response.data.errors)[0] as string[];
        toast.error(firstErr?.[0] ?? "Validation error");
      } else {
        toast.error("Failed to update event");
      }
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async () => {
    if (!editingEventId) return;
    try {
      await axios.delete(`/admin/events/${editingEventId}`);
      toast.success("Event deleted");
      setIsEditOpen(false);
      resetForm();
      fetchEvents();
    } catch {
      toast.error("Failed to delete event");
    }
  };

  /* ---------- FULLCALENDAR HANDLERS ---------- */
  const onEventClick = (info: EventClickArg) => {
    setEditingEventId(info.event.id);
    setFormData({
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      all_day: info.event.allDay,
      description: info.event.extendedProps?.description ?? null,
    });
    setIsEditOpen(true);
  };

  const onEventDropOrResize = async (
    info: EventDropArg | EventResizeDoneArg
  ) => {
    try {
      await axios.put(`/admin/events/${info.event.id}`, {
        title: info.event.title,
        start_datetime: info.event.startStr,
        end_datetime: info.event.endStr,
        all_day: info.event.allDay,
      });
      toast.success("Event updated");
    } catch {
      toast.error("Failed to update event");
      info.revert();
    }
  };

  return (
    <AppLayout>
      <Head title="Admin Calendar" />
      <div className="p-4 space-y-4">
        {/* Header + New Event */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
            <DialogTrigger asChild>
              <Button>+ New Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Label>Title</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                />

                <Label>Description</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                />

                <Label>Start</Label>
                <Input
                  type="datetime-local"
                  value={formData.start || ""}
                  onChange={(e) => handleFormChange("start", e.target.value)}
                />

                <Label>End</Label>
                <Input
                  type="datetime-local"
                  value={formData.end || ""}
                  onChange={(e) => handleFormChange("end", e.target.value)}
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={!!formData.all_day}
                    onCheckedChange={(v) => handleFormChange("all_day", v)}
                  />
                  <Label>All Day</Label>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleNewSubmit}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar */}
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          events={events}
          editable
          selectable
          eventClick={onEventClick}
          eventDrop={onEventDropOrResize}
          eventResize={onEventDropOrResize}
          height="calc(100vh - 6rem)"
        />

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Title</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => handleFormChange("title", e.target.value)}
              />

              <Label>Description</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
              />

              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={formData.start || ""}
                onChange={(e) => handleFormChange("start", e.target.value)}
              />

              <Label>End</Label>
              <Input
                type="datetime-local"
                value={formData.end || ""}
                onChange={(e) => handleFormChange("end", e.target.value)}
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={!!formData.all_day}
                  onCheckedChange={(v) => handleFormChange("all_day", v)}
                />
                <Label>All Day</Label>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
              <Button onClick={handleEditSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
