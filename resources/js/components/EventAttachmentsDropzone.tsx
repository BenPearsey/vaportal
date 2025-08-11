import { useCallback, useImperativeHandle, useState, forwardRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "@/bootstrap-axios";
import { Button } from "@/components/ui/button";

/**
 * The parent can call ref.current.flush(eventId) right after it
 * receives the freshly-created ID.
 */
export default forwardRef(function EventAttachmentsDropzone(
  { eventId, existing = [], onUploaded },
  ref
) {
  const [files, setFiles]   = useState(existing);
  const [queue, setQueue]   = useState<File[]>([]);     // files added before save
  const [busy,  setBusy]    = useState(false);

  /* upload helper */
  const upload = async (file: File, evtId: number) => {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axios.post(
      route("admin.events.attachments.store", { event: evtId }),
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    setFiles(f => [...f, data]);
    onUploaded?.(data);
  };

  /* onDrop — upload immediately if we have an ID, else queue */
  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (eventId) {
        setBusy(true);
        for (const f of accepted) await upload(f, eventId);
        setBusy(false);
      } else {
        setQueue(q => [...q, ...accepted]);
        setFiles(f => [
          ...f,
          ...accepted.map(a => ({ id: a.name, original_name: a.name, size: a.size })),
        ]);
      }
    },
    [eventId] // eslint-disable-line
  );

  /* allow parent to flush queue after create */
  useImperativeHandle(ref, () => ({
    async flush(evtId: number) {
      if (queue.length === 0) return;
      setBusy(true);
      for (const f of queue) await upload(f, evtId);
      setQueue([]); setBusy(false);
    },
  }));

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop, noClick: true,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border border-dashed rounded-lg p-4 text-center cursor-pointer ${
          isDragActive ? "border-primary" : "border-muted"
        } ${busy && "opacity-60 pointer-events-none"}`}
      >
        <input {...getInputProps()} />
        <p className="text-sm">
          Drag & drop files here
          <br />
          or use the button below (50&nbsp;MB&nbsp;max)
        </p>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={open} disabled={busy}>
        Browse files
      </Button>

      {files.length > 0 && (
        <ul className="text-sm space-y-1">
          {files.map((f: any) => (
            <li key={f.id}>
              {f.original_name ?? f.name}{" "}
              {f.size && (
                <span className="text-muted-foreground">
                  ({(f.size / 1024).toFixed(0)} KB)
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
