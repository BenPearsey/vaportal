/* ------------------------------------------------------------------------- */
/* AdminCalendarPage.tsx                                                     */
/* ------------------------------------------------------------------------- */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout-admin";

import FullCalendar, {
  EventClickArg,
  EventDropArg,
  EventResizeDoneArg,
  EventInput,
} from "@fullcalendar/react";
import dayGridPlugin     from "@fullcalendar/daygrid";
import timeGridPlugin    from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin        from "@fullcalendar/list";
import rrulePlugin       from "@fullcalendar/rrule";

import { RRule } from "rrule";
import dayjs     from "dayjs";

import DaySidebar       from "@/components/DaySidebar";
import RecurrenceWizard from "@/components/RecurrenceWizard";
import PeopleSelector   from "@/components/PeopleSelector";
import type { Person }  from "@/components/PeopleSelector";

import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch }   from "@/components/ui/switch";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";


import axios  from "@/bootstrap-axios";
import { toast } from "sonner";

/* ────────────────────────────────────────────────────────── */
/* helpers */
const typeIcon: Record<string,string> = { Meeting:"📅", Call:"📞", Task:"✅", "Video Call":"📌" };
const priorityColor: Record<string,string> = { high:"#dc2626", medium:"#f59e0b", low:"#16a34a" };
const ownerColor = (id:number) => `hsl(${(id*47)%360} 70% 45%)`;

/* ────────────────────────────────────────────────────────── */
/* API → FullCalendar */
const toEventInput = (e:any):EventInput => {
  const participants:Person[] = [
    ...(e.user_participants    ?? []).map((u:any)=>({ id:u.id, type:"user",    name:u.display_name ?? u.name ?? u.email, email:u.email })),
    ...(e.contact_participants ?? []).map((c:any)=>({ id:c.id, type:"contact", name:(c.firstname||c.lastname)?`${c.firstname??""} ${c.lastname??""}`.trim():c.company, email:c.email })),
  ];

  const ownerId   = e.owner_id ?? e.owner?.id;
  const ownerName = e.owner?.display_name ?? e.owner?.name ?? "Owner";
  const ownerRole = e.owner?.role ?? null;

  const base:EventInput = {
    id:e.id,
    title:`${typeIcon[e.activity_type]??""} ${e.title}`,
    allDay:e.all_day,
    description:e.description,
    participants,
    backgroundColor:priorityColor[e.priority ?? "medium"],
    classNames:e.status==="completed"?["line-through","opacity-60"]:[],
    ownerId, ownerName, ownerRole,
    status:e.status, priority:e.priority, location:e.location, reminder_minutes:e.reminder_minutes,
  };

  return e.recurrence_rule
    ? { ...base,
        start:e.start_datetime,                       // needed for sidebar agenda
        rrule:{ dtstart:e.start_datetime, ...RRule.parseString(e.recurrence_rule) },
        duration:{ minutes:(+new Date(e.end_datetime)-+new Date(e.start_datetime))/60000 } }
    : { ...base, start:e.start_datetime, end:e.end_datetime };
};

/* ────────────────────────────────────────────────────────── */
/* form shape */
interface CalendarEvent{
  id?:number|string;
  title?:string;
  description?:string|null;
  start?:string; end?:string; all_day?:boolean;
  recurrence_rule?:string|null;
  activity_type?:"Meeting"|"Call"|"Task"|"Video Call";
  status?:"scheduled"|"completed"|"canceled";
  priority?:"low"|"medium"|"high";
  location?:string|null;
  reminder_minutes?:number|null;
  participants:Person[];
}

/* --------------------------------------------------------------------- */
export default function AdminCalendarPage(){
  /* current user (may be undefined in dev hot-reload) */
  const { auth } = usePage().props as { auth?: { user?: { id:number; role:string; name?:string; display_name?:string } } };
  const me      = auth?.user;
  const isAdmin = me?.role === "admin";

  /* refs & state */
  const calRef = useRef<FullCalendar|null>(null);

  const [events,setEvents] = useState<EventInput[]>([]);
  const [owners,setOwners] = useState<{id:number;name:string;color:string}[]>([]);
  const [visibleOwners,setVisibleOwners] = useState<Record<number,boolean>>({});

  const [loading,setLoading] = useState(false);
  const [isNewOpen,setIsNewOpen]   = useState(false);
  const [isViewOpen,setIsViewOpen] = useState(false);
  const [isEditOpen,setIsEditOpen] = useState(false);
  const [selectedDate,setSelectedDate] = useState<Date>(new Date());

  /* form */
  const blank:CalendarEvent = { all_day:false, activity_type:"Meeting", status:"scheduled", priority:"medium", participants:[] };
  const [form,setForm] = useState<CalendarEvent>(blank);
  const [editingId,setEditingId] = useState<number|string|null>(null);
  const [showRecurrence,setShowRecurrence] = useState(false);

  /* ───────────────── fetch events on mount ───────────────── */
  useEffect(()=>{ (async()=>{
    setLoading(true);
    try{
      const { data } = await axios.get("/admin/events");
      const evts:EventInput[] = data.map(toEventInput);
      setEvents(evts);

      /* owner toggle list – admins only */
      if(isAdmin){
        const map:Record<number,{id:number;name:string;color:string}> = {};
        evts.forEach(ev=>{
          if(ev.ownerId==null)                          return;
          if(ev.ownerId===me?.id)                       return;  // hide self
          if(ev.ownerRole!=="admin")                    return;  // only admins
          if(!map[ev.ownerId]) map[ev.ownerId]={id:ev.ownerId,name:ev.ownerName,color:ownerColor(ev.ownerId)};
        });
        setOwners(Object.values(map));
        setVisibleOwners(Object.fromEntries(Object.keys(map).map(id=>[+id,true])));
      }
    }catch{ toast.error("Failed to load events"); }
    finally{ setLoading(false); }
  })(); },[isAdmin,me?.id]);

  /* ───────────────── derived views ───────────────── */
  const visibleEvents = useMemo(()=> {
    if(!isAdmin) return events;  // agents see whatever backend allowed
    return events.filter(ev=>{
      if(ev.ownerId==null||ev.ownerId===me?.id) return true;          // always show own/no-owner
      if(ev.ownerRole!=="admin")                 return true;         // always show agents & contacts
      return visibleOwners[ev.ownerId];                               // other admins via toggle
    });
  },[events,visibleOwners,isAdmin,me?.id]);

  const agenda = useMemo(()=>{
    const day = dayjs(selectedDate);
    return visibleEvents
      .filter(ev=>ev.start && dayjs(ev.start as string).isSame(day,"day"))
      .sort((a,b)=>(a.start as string).localeCompare(b.start as string))
      .map(ev=>({ id:ev.id!, title:ev.title!, time:dayjs(ev.start as string).format("h:mm A"), completed:ev.extendedProps?.status==="completed" }));
  },[visibleEvents,selectedDate]);

  /* ───────────────── helpers ───────────────── */
  const reset = ()=>{ setForm(blank); setEditingId(null); setShowRecurrence(false); };
  const setField = (k:keyof CalendarEvent,v:any)=>setForm(p=>({...p,[k]:v}));
  const payload  = ()=>({
    title:form.title, description:form.description,
    start_datetime:form.start, end_datetime:form.end, all_day:form.all_day,
    recurrence_rule:showRecurrence?form.recurrence_rule:null,
    activity_type:form.activity_type, status:form.status, priority:form.priority,
    location:form.location, reminder_minutes:form.reminder_minutes,
    user_participants:form.participants.filter(p=>p.type==="user").map(p=>p.id),
    contact_participants:form.participants.filter(p=>p.type==="contact").map(p=>p.id),
  });
  const toggleOwner = (id:number)=>setVisibleOwners(v=>({...v,[id]:!v[id]}));

  /* ---------------- CRUD & status ---------------- */
  const createEvent = async()=>{ try{
      const {data}=await axios.post("/admin/events",payload());
      setEvents(e=>[...e,toEventInput(data)]);
      toast.success("Event created"); setIsNewOpen(false); reset();
  }catch{toast.error("Create failed");} };
  const updateEvent = async()=>{ if(!editingId) return; try{
      const {data}=await axios.put(`/admin/events/${editingId}`,payload());
      setEvents(evts=>evts.map(ev=>ev.id===data.id?toEventInput(data):ev));
      toast.success("Event updated"); setIsEditOpen(false); reset();
  }catch{toast.error("Update failed");} };
  const deleteEvent = async()=>{ if(!editingId) return; try{
      await axios.delete(`/admin/events/${editingId}`);
      setEvents(evts=>evts.filter(ev=>ev.id!==editingId));
      toast.success("Event deleted"); setIsEditOpen(false); reset();
  }catch{toast.error("Delete failed");} };
  const setStatus = async(status:"completed"|"scheduled")=>{ if(!editingId) return; try{
      const {data}=await axios.put(`/admin/events/${editingId}`,{status});
      setEvents(evts=>evts.map(ev=>ev.id===data.id?toEventInput(data):ev));
      toast.success(status==="completed"?"Completed":"Re-opened"); setIsViewOpen(false); reset();
  }catch{toast.error("Update failed");} };

  const moveEvent = async(info:EventDropArg|EventResizeDoneArg)=>{ try{
      await axios.put(`/admin/events/${info.event.id}`,{start_datetime:info.event.startStr,end_datetime:info.event.endStr,all_day:info.event.allDay});
      setEvents(evts=>evts.map(ev=>ev.id===info.event.id?{...ev,start:info.event.startStr,end:info.event.endStr}:ev));
  }catch{toast.error("Update failed"); info.revert();} };

  const openViewer = (arg:EventClickArg)=>{
    setSelectedDate(arg.event.start!);
    const participants:Person[] = arg.event.extendedProps?.participants ?? [];
    setEditingId(arg.event.id);
    setForm({
      id:arg.event.id,
      title:arg.event.title.replace(/^[^\s]\s/,""),
      description:arg.event.extendedProps?.description,
      start:arg.event.startStr, end:arg.event.endStr, all_day:arg.event.allDay,
      recurrence_rule:arg.event.extendedProps?.rruleString ?? arg.event.extendedProps?.rrule ?? null,
      activity_type:"Meeting", status:arg.event.extendedProps?.status ?? "scheduled",
      priority:arg.event.extendedProps?.priority ?? "medium", location:arg.event.extendedProps?.location ?? null,
      reminder_minutes:arg.event.extendedProps?.reminder_minutes ?? null, participants,
    });
    setShowRecurrence(!!arg.event.extendedProps?.rruleString); setIsViewOpen(true);
  };

  /* ─────────────────────────── JSX ─────────────────────────── */
  return(
    <AppLayout>
      <Head title="Admin Calendar"/>
      <div className="flex gap-4 p-4">

        {/* ===== calendar column ===== */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Calendar</h1>

              {/* new event dialog */}
              <Dialog open={isNewOpen} onOpenChange={o=>{setIsNewOpen(o); if(!o)reset();}}>
                <DialogTrigger asChild><Button>+ New Event</Button></DialogTrigger>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
                  <EventForm formData={form} onChange={setField} showRecurrence={showRecurrence} setShowRecurrence={setShowRecurrence}/>
                  <DialogFooter><Button onClick={createEvent} disabled={loading||!form.title||!form.start||!form.end}>Create</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

{/* owner toggles (admins only) */}
{isAdmin && owners.length > 0 && (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        Admin calendars&nbsp;
        <span className="text-xs text-muted-foreground">
          ({Object.values(visibleOwners).filter(Boolean).length}/{owners.length})
        </span>
      </Button>
    </DropdownMenuTrigger>

    {/* pop-up list –  max-height 14 rem, scrolls if long */}
    <DropdownMenuContent className="p-0">
      <ScrollArea className="h-56"> {/* 14rem ≈ 224 px */}
        {owners.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.id}
            checked={visibleOwners[o.id]}
            onCheckedChange={() => toggleOwner(o.id)}
            className="flex items-center gap-2"
          >
            {/* tiny color dot */}
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: o.color }}
            />
            {o.name}
          </DropdownMenuCheckboxItem>
        ))}
      </ScrollArea>
    </DropdownMenuContent>
  </DropdownMenu>
)}
</div>

          {/* FullCalendar */}
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin,listPlugin,rrulePlugin]}
            initialView="dayGridMonth"
            headerToolbar={{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay,listWeek"}}
            events={visibleEvents}
            editable selectable
            dateClick={arg=>setSelectedDate(arg.date)}
            eventClick={openViewer}
            eventDrop={moveEvent} eventResize={moveEvent}
            height="calc(100vh - 8rem)"
            eventDataTransform={raw=>raw.rrule?{...raw,rruleString:raw.rrule}:raw}
          />
        </div>

        {/* ===== sidebar ===== */}
        <DaySidebar selected={selectedDate} onSelectDate={setSelectedDate} agenda={agenda}/>
      </div>

      {/* ===== VIEW dialog ===== */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{form.title}</DialogTitle></DialogHeader>

          <div className="space-y-2">
            {form.description && <p className="whitespace-pre-line">{form.description}</p>}
            <p><b>Start:</b> {new Date(form.start!).toLocaleString()}</p>
            <p><b>End:</b>   {new Date(form.end!).toLocaleString()}</p>
            {form.location && <p><b>Location:</b> {form.location}</p>}
            <p><b>Priority:</b> {form.priority}</p>
            {form.reminder_minutes!=null &&
              <p><b>Reminder:</b> {form.reminder_minutes===1440?"1 day":form.reminder_minutes+" min"}</p>}
            {form.recurrence_rule && <p className="text-sm italic">Recurring event</p>}
            {form.participants.length>0 && (
              <>
                <b>Invitees:</b>
                <ul className="ml-5 list-disc">{form.participants.map(p=><li key={`${p.type}-${p.id}`}>{p.name}</li>)}</ul>
              </>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            {form.status==="completed"
              ? <Button variant="outline" onClick={()=>setStatus("scheduled")}>Undo Complete</Button>
              : <Button variant="outline" onClick={()=>setStatus("completed")}>Mark Complete</Button>}
            <div className="flex gap-2">
              <Button onClick={()=>{setIsViewOpen(false); setIsEditOpen(true);}}>Edit</Button>
              <Button variant="secondary" onClick={()=>setIsViewOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT dialog ===== */}
      <Dialog open={isEditOpen} onOpenChange={o=>{setIsEditOpen(o); if(!o)reset();}}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
          <EventForm formData={form} onChange={setField} showRecurrence={showRecurrence} setShowRecurrence={setShowRecurrence}/>
          <DialogFooter className="flex justify-between">
            <Button variant="destructive" onClick={deleteEvent}>Delete</Button>
            <Button onClick={updateEvent} disabled={loading||!form.title||!form.start||!form.end}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

/* ----------------------------------------------------------------- */
/* EventForm (unchanged helper)                                      */
/* ----------------------------------------------------------------- */
interface FormProps{
  formData:CalendarEvent;
  onChange:(k:keyof CalendarEvent,v:any)=>void;
  showRecurrence:boolean;
  setShowRecurrence:(b:boolean)=>void;
}
function EventForm({formData,onChange,showRecurrence,setShowRecurrence}:FormProps){
  const preset=(m:number)=>{ if(!formData.start) return; const s=new Date(formData.start); onChange("end",new Date(s.getTime()+m*60000).toISOString().slice(0,16)); };
  return(
    <>
      <div className="space-y-3">
        <Label>Title</Label><Input value={formData.title||""} onChange={e=>onChange("title",e.target.value)}/>
        <Label>Description</Label><Textarea value={formData.description||""} onChange={e=>onChange("description",e.target.value)}/>
        <Label>Start</Label><Input type="datetime-local" value={formData.start||""} onChange={e=>onChange("start",e.target.value)}/>
        <Label>End</Label><Input type="datetime-local" value={formData.end||""} onChange={e=>onChange("end",e.target.value)}/>
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <Label>Duration&nbsp;</Label>
          {[15,30,60,120].map(m=><Button key={m} variant="outline" size="sm" onClick={()=>preset(m)}>{m<60?`${m} m`:`${m/60} h`}</Button>)}
        </div>
        <div className="flex items-center space-x-2"><Checkbox checked={!!formData.all_day} onCheckedChange={v=>onChange("all_day",v)}/><Label>All Day</Label></div>
        <Label>Activity Type</Label>
        <Select value={formData.activity_type||"Meeting"} onValueChange={v=>onChange("activity_type",v as any)}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select type"/></SelectTrigger>
          <SelectContent>{["Meeting","Call","Task","Video Call"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Label>Priority</Label>
        <Select value={formData.priority||"medium"} onValueChange={v=>onChange("priority",v as any)}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Priority"/></SelectTrigger>
          <SelectContent>{["high","medium","low"].map(p=><SelectItem key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</SelectItem>)}</SelectContent>
        </Select>
        <Label>Location</Label><Input value={formData.location||""} onChange={e=>onChange("location",e.target.value)}/>
        <Label>Reminder</Label>
        <Select value={formData.reminder_minutes!=null?String(formData.reminder_minutes):"none"} onValueChange={v=>onChange("reminder_minutes",v==="none"?null:+v)}>
          <SelectTrigger className="w-full"><SelectValue placeholder="None"/></SelectTrigger>
          <SelectContent>{[["none","None"],["5","5 minutes"],["15","15 minutes"],["60","1 hour"],["1440","1 day"]].map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
        </Select>
        <Label>Participants</Label><PeopleSelector value={formData.participants} onChange={v=>onChange("participants",v)}/>
      </div>

      <div className="pt-4 border-t space-y-2">
        <div className="flex items-center justify-between">
          <Label className="font-semibold">Recurring</Label>
          <Switch checked={showRecurrence} onCheckedChange={v=>{setShowRecurrence(v); if(!v) onChange("recurrence_rule",null);}}/>
        </div>
        {showRecurrence&&formData.start&&(
          <RecurrenceWizard open dtStart={formData.start} value={formData.recurrence_rule??null} onChange={rule=>onChange("recurrence_rule",rule)}/>
        )}
      </div>
    </>
  );
}
