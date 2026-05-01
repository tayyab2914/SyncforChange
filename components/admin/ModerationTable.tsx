"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import { approveEvent, rejectEvent } from "@/actions/moderateEvent";
import type { AdminEvent, EventStatus } from "@/types";
import EventDetailModal from "./EventDetailModal";

const POLL_MS = 10_000;

const PAGE_SIZE = 10;

interface Props {
  events: AdminEvent[];
}

export default function ModerationTable({ events: initial }: Props) {
  const [events, setEvents] = useState(initial);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  // Poll every 10s for new pending submissions
  const knownIds = useRef(new Set(initial.map((e) => e.id)));

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/events", { cache: "no-store" });
        if (!res.ok) return;
        const { events: latest } = (await res.json()) as { events: AdminEvent[] };

        const newPending = latest.filter(
          (e) => e.status === "pending" && !knownIds.current.has(e.id)
        );

        if (newPending.length > 0 || latest.length !== knownIds.current.size) {
          setEvents(latest);
          knownIds.current = new Set(latest.map((e) => e.id));
          if (newPending[0]) {
            setToast(newPending[0].title);
            setTimeout(() => setToast(null), 5000);
          }
        }
      } catch {
        // silent
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, []);

  const openEvent = events.find((e) => e.id === openId) ?? null;

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.host_name.toLowerCase().includes(search.toLowerCase()) ||
      e.submitted_by_email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateStatus(id: string, status: EventStatus, reason?: string) {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status, rejection_reason: reason ?? e.rejection_reason } : e
      )
    );
  }

  function removeEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    knownIds.current.delete(id);
  }

  return (
    <>
    {openEvent && (
      <EventDetailModal
        event={openEvent}
        onClose={() => setOpenId(null)}
        onStatusChange={updateStatus}
        onDelete={removeEvent}
      />
    )}
    {toast && (
      <div className="fixed bottom-6 right-6 bg-primary text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-50">
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          notifications_active
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-widest opacity-70">New Submission</p>
          <p className="text-sm font-bold">{toast}</p>
        </div>
      </div>
    )}
    <section className="bg-surface-container-low rounded-3xl overflow-hidden">
      {/* Controls */}
      <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low">
        <div className="relative w-full sm:w-96 group">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-surface-container-lowest border-none rounded-xl px-12 py-3 focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-stone-400 transition-all outline-none"
            placeholder="Search submissions…"
            type="text"
          />
          <span className="material-symbols-outlined absolute left-4 top-3 text-stone-400 group-focus-within:text-primary transition-colors">
            search
          </span>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-lowest rounded-xl text-xs font-bold uppercase tracking-widest text-stone-500 shadow-sm">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-stone-500 uppercase text-[0.7rem] font-black tracking-[0.15em] text-left">
              <th className="px-8 py-4 bg-surface-container-high/30">Event &amp; Submission</th>
              <th className="px-6 py-4 bg-surface-container-high/30">Organization</th>
              <th className="px-6 py-4 bg-surface-container-high/30">Date Submitted</th>
              <th className="px-6 py-4 bg-surface-container-high/30">Status</th>
              <th className="px-8 py-4 bg-surface-container-high/30 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-stone-400">
                  <span className="material-symbols-outlined text-4xl block mb-3">inbox</span>
                  <p className="font-bold">No events found.</p>
                </td>
              </tr>
            ) : (
              paginated.map((event) => (
                <ModerationRow
                  key={event.id}
                  event={event}
                  onStatusChange={updateStatus}
                  onOpenDetails={() => setOpenId(event.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden p-4 space-y-3">
        {paginated.length === 0 ? (
          <div className="px-8 py-16 text-center text-stone-400">
            <span className="material-symbols-outlined text-4xl block mb-3">inbox</span>
            <p className="font-bold">No events found.</p>
          </div>
        ) : (
          paginated.map((event) => (
            <ModerationCard
              key={event.id}
              event={event}
              onStatusChange={updateStatus}
              onOpenDetails={() => setOpenId(event.id)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-stone-200/50 bg-surface-container-low">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
          Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} Submissions
        </span>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 text-stone-400 disabled:opacity-30 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors ${
                  page === n
                    ? "bg-primary text-white"
                    : "hover:bg-surface-container-high text-stone-600"
                }`}
              >
                {n}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 text-stone-400 disabled:opacity-30 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
    </>
  );
}

function ModerationRow({
  event,
  onStatusChange,
  onOpenDetails,
}: {
  event: AdminEvent;
  onStatusChange: (id: string, status: EventStatus, reason?: string) => void;
  onOpenDetails: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const isRejected = event.status === "rejected";
  const isApproved = event.status === "approved";
  const isPendingStatus = event.status === "pending";

  function handleApprove() {
    startTransition(async () => {
      const res = await approveEvent(event.id);
      if (res.error) { setError(res.error); return; }
      onStatusChange(event.id, "approved");
    });
  }

  function handleReject() {
    if (!reason.trim()) { setError("Reason required."); return; }
    startTransition(async () => {
      const res = await rejectEvent(event.id, reason);
      if (res.error) { setError(res.error); return; }
      onStatusChange(event.id, "rejected", reason);
      setShowReject(false);
      setReason("");
    });
  }

  function handleRestore() {
    startTransition(async () => {
      const res = await approveEvent(event.id);
      if (res.error) { setError(res.error); return; }
      onStatusChange(event.id, "approved");
    });
  }

  return (
    <>
      <tr
        className={`hover:bg-surface-container-lowest transition-colors group ${
          isRejected ? "bg-error/5" : ""
        } ${isPending ? "opacity-100" : "opacity-80"}`}
      >
        {/* Event */}
        <td className="px-8 py-5">
          <button
            type="button"
            onClick={onOpenDetails}
            className="flex items-center gap-4 text-left w-full"
          >
            <Thumbnail src={event.hero_image_url} label={event.title[0]} grayscale={isRejected} />
            <div>
              <div
                className={`font-bold text-on-surface group-hover:text-primary transition-colors ${
                  isRejected ? "line-through decoration-stone-400" : ""
                }`}
              >
                {event.title}
              </div>
              {isRejected && event.rejection_reason ? (
                <div className="text-xs text-error mt-0.5">
                  Reason: {event.rejection_reason}
                </div>
              ) : (
                <div className="text-xs text-stone-500 mt-0.5">
                  {event.cause_areas[0] ?? event.event_types[0] ?? ""}
                </div>
              )}
              {event.openFlagCount > 0 && (
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-error/10 text-error text-[10px] font-bold">
                  <span className="material-symbols-outlined text-xs">flag</span>
                  {event.openFlagCount} report
                  {event.openFlagCount !== 1 ? "s" : ""}
                </div>
              )}
              {error && (
                <p className="text-xs text-error font-medium mt-0.5">{error}</p>
              )}
            </div>
          </button>
        </td>

        {/* Organization */}
        <td className="px-6 py-5 text-sm font-medium text-on-surface-variant italic">
          {event.host_name}
        </td>

        {/* Date */}
        <td className="px-6 py-5 text-sm text-stone-500">
          {format(parseISO(event.created_at), "MMM d, yyyy")}
        </td>

        {/* Status badge */}
        <td className="px-6 py-5">
          <StatusBadge status={event.status} />
        </td>

        {/* Actions */}
        <td className="px-8 py-5 text-right">
          <div className="flex justify-end gap-1">
            {isPendingStatus && (
              <>
                <ActionBtn
                  icon="check_circle"
                  filled
                  color="text-primary hover:bg-primary/10"
                  title="Approve"
                  onClick={handleApprove}
                  disabled={isPending}
                />
                <ActionBtn
                  icon="edit_note"
                  color="text-tertiary hover:bg-tertiary/10"
                  title="Request Edits"
                  onClick={() => { setShowReject((v) => !v); setError(""); }}
                  disabled={isPending}
                />
              </>
            )}
            {isRejected && (
              <ActionBtn
                icon="restore"
                color="text-stone-400 hover:text-primary hover:bg-primary/10"
                title="Re-approve"
                onClick={handleRestore}
                disabled={isPending}
              />
            )}
            {isApproved && (
              <ActionBtn
                icon="cancel"
                color="text-stone-400 hover:text-error hover:bg-error/10"
                title="Revoke"
                onClick={() => { setShowReject((v) => !v); setError(""); }}
                disabled={isPending}
              />
            )}
            <ActionBtn
              icon="visibility"
              color="text-stone-400 hover:text-primary hover:bg-primary/10"
              title="View full details"
              onClick={onOpenDetails}
            />
          </div>
        </td>
      </tr>

      {/* Inline edits-request feedback */}
      {showReject && (
        <tr className="bg-tertiary/5">
          <td colSpan={5} className="px-8 pb-5">
            <div className="flex gap-3 items-start">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Tell the organizer what needs to change…"
                className="flex-1 bg-white border border-tertiary/20 rounded-xl text-sm p-3 focus:ring-2 focus:ring-tertiary/20 outline-none resize-none"
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="px-4 py-2 bg-tertiary text-white rounded-xl text-xs font-bold hover:scale-95 transition-transform disabled:opacity-50"
                >
                  Send
                </button>
                <button
                  onClick={() => { setShowReject(false); setReason(""); setError(""); }}
                  className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ModerationCard({
  event,
  onStatusChange,
  onOpenDetails,
}: {
  event: AdminEvent;
  onStatusChange: (id: string, status: EventStatus, reason?: string) => void;
  onOpenDetails: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const isPendingStatus = event.status === "pending";
  const isRejected = event.status === "rejected";

  function handleApprove() {
    startTransition(async () => {
      const res = await approveEvent(event.id);
      if (res.error) return setError(res.error);
      onStatusChange(event.id, "approved");
    });
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm">
      <button
        type="button"
        onClick={onOpenDetails}
        className="flex items-start gap-3 w-full text-left"
      >
        <Thumbnail src={event.hero_image_url} label={event.title[0]} grayscale={isRejected} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 justify-between">
            <h3 className={`font-bold text-on-surface text-sm leading-snug ${isRejected ? "line-through" : ""}`}>
              {event.title}
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1 truncate">{event.host_name}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-400">
            <span className="material-symbols-outlined text-xs">calendar_today</span>
            <span>{format(parseISO(event.created_at), "MMM d")}</span>
            <span className="ml-auto">
              <StatusBadge status={event.status} />
            </span>
          </div>
        </div>
      </button>

      {isRejected && event.rejection_reason && (
        <p className="text-[11px] text-error mt-3 px-1">
          Reason: {event.rejection_reason}
        </p>
      )}

      {error && <p className="text-[11px] text-error mt-2">{error}</p>}

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100">
        <button
          onClick={onOpenDetails}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-stone-700 text-xs font-bold py-2.5 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-base">visibility</span>
          Details
        </button>
        {isPendingStatus && (
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:scale-95 transition-transform disabled:opacity-50"
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            Approve
          </button>
        )}
      </div>
    </div>
  );
}

function Thumbnail({
  src,
  label,
  grayscale,
}: {
  src: string | null;
  label: string;
  grayscale?: boolean;
}) {
  if (src) {
    return (
      <div className={`h-12 w-12 rounded-xl overflow-hidden shrink-0 ${grayscale ? "grayscale opacity-40" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 font-black text-lg ${
        grayscale
          ? "bg-stone-200 text-stone-400"
          : "bg-primary/10 text-primary"
      }`}
    >
      {label.toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }: { status: EventStatus }) {
  const map: Record<EventStatus, { bg: string; text: string; dot: string; label: string }> = {
    pending:  { bg: "bg-tertiary/10",  text: "text-tertiary",  dot: "bg-tertiary",  label: "Pending"  },
    approved: { bg: "bg-primary/10",   text: "text-primary",   dot: "bg-primary",   label: "Approved" },
    rejected: { bg: "bg-error/10",     text: "text-error",     dot: "bg-error",     label: "Rejected" },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${s.bg} ${s.text} text-[0.65rem] font-black uppercase tracking-wider`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function ActionBtn({
  icon,
  filled,
  color,
  title,
  onClick,
  disabled,
}: {
  icon: string;
  filled?: boolean;
  color: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${color}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      <span
        className="material-symbols-outlined text-xl"
        style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
    </button>
  );
}
