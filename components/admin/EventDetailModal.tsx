"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  approveEvent,
  rejectEvent,
  deleteEventAction,
  resolveFlagsAction,
} from "@/actions/moderateEvent";
import type { AdminEvent, EventStatus } from "@/types";

interface Props {
  event: AdminEvent;
  onClose: () => void;
  onStatusChange: (id: string, status: EventStatus, reason?: string) => void;
  onDelete?: (id: string) => void;
}

export default function EventDetailModal({
  event,
  onClose,
  onStatusChange,
  onDelete,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // Lock background scroll
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleApprove() {
    startTransition(async () => {
      const res = await approveEvent(event.id);
      if (res.error) return setError(res.error);
      onStatusChange(event.id, "approved");
      onClose();
    });
  }

  function handleReject() {
    if (!reason.trim()) return setError("Please enter a rejection reason.");
    startTransition(async () => {
      const res = await rejectEvent(event.id, reason);
      if (res.error) return setError(res.error);
      onStatusChange(event.id, "rejected", reason);
      onClose();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteEventAction(event.id);
      if (res.error) return setError(res.error);
      onDelete?.(event.id);
      onClose();
    });
  }

  function handleResolveFlags() {
    startTransition(async () => {
      const res = await resolveFlagsAction(event.id);
      if (res.error) return setError(res.error);
      onClose();
    });
  }

  const submitter = event.submitter;
  const profileFallback =
    (submitter?.displayName ?? submitter?.email ?? "?")[0]?.toUpperCase() ?? "?";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-screen sm:h-auto sm:max-h-[92vh] bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 md:px-8 py-4 md:py-5 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="min-w-0 flex-1 mr-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
              Submission Details
            </p>
            <h2 className="text-base md:text-lg font-bold text-on-surface tracking-tight mt-0.5 truncate">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-stone-500">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {/* Hero */}
          <div className="relative h-56 md:h-72 bg-gradient-to-br from-primary/15 to-tertiary/15">
            {event.hero_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.hero_image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-primary/40 text-7xl font-black">
                  {event.title[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <StatusBadge status={event.status} />
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Quick facts grid */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Fact icon="calendar_month" label="Starts" value={format(parseISO(event.starts_at), "MMM d, yyyy · h:mm a")} />
              {event.ends_at && (
                <Fact icon="schedule" label="Ends" value={format(parseISO(event.ends_at), "MMM d, yyyy · h:mm a")} />
              )}
              <Fact icon="place" label="Location" value={event.location_name} />
              {event.address && (
                <Fact icon="map" label="Address" value={event.address} />
              )}
              <Fact
                icon="upload_file"
                label="Submitted"
                value={format(parseISO(event.created_at), "MMM d, yyyy")}
              />
              {event.total_spots != null && (
                <Fact
                  icon="groups"
                  label="Capacity"
                  value={String(event.total_spots)}
                />
              )}
            </section>

            {/* Tags */}
            {(event.cause_areas.length > 0 || event.event_types.length > 0) && (
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.cause_areas.map((c) => (
                    <span
                      key={`c-${c}`}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary"
                    >
                      {c}
                    </span>
                  ))}
                  {event.event_types.map((t) => (
                    <span
                      key={`t-${t}`}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-secondary/10 text-secondary"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Description */}
            {event.description && (
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3">
                  Description
                </h3>
                <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </section>
            )}

            {/* External links */}
            {(event.rsvp_link || event.volunteer_link || event.contact_link) && (
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3">
                  Links
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.rsvp_link && <LinkPill href={event.rsvp_link} icon="event_available" label="RSVP" />}
                  {event.volunteer_link && <LinkPill href={event.volunteer_link} icon="volunteer_activism" label="Volunteer" />}
                  {event.contact_link && <LinkPill href={event.contact_link} icon="mail" label="Contact" />}
                </div>
              </section>
            )}

            {/* Organizer card */}
            <section className="bg-gradient-to-br from-primary/5 to-tertiary/5 rounded-2xl p-6 border border-stone-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4">
                Organization Profile
              </h3>

              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center shrink-0">
                  {submitter?.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={submitter.profileImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary text-3xl font-black">
                      {profileFallback}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {submitter?.profileCompleted ? (
                    <>
                      <p className="text-sm font-bold text-on-surface">
                        {submitter.displayName}
                      </p>
                      {submitter.organizationType && (
                        <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {submitter.organizationType}
                        </span>
                      )}
                      {submitter.location && (
                        <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">place</span>
                          {submitter.location}
                        </p>
                      )}
                      {submitter.bio && (
                        <p className="text-xs text-on-surface-variant mt-3 leading-relaxed line-clamp-3">
                          {submitter.bio}
                        </p>
                      )}
                      {submitter.causeFocus.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {submitter.causeFocus.map((c) => (
                            <span
                              key={c}
                              className="text-[10px] font-bold bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-full"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Link
                          href={`/profile/${submitter.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white transition-colors px-3 py-1.5 rounded-full"
                        >
                          <span className="material-symbols-outlined text-sm">person</span>
                          Full Profile
                        </Link>
                        {submitter.website && (
                          <a
                            href={submitter.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors px-3 py-1.5 rounded-full"
                          >
                            <span className="material-symbols-outlined text-sm">link</span>
                            Website
                          </a>
                        )}
                        <a
                          href={`mailto:${submitter.email}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors px-3 py-1.5 rounded-full"
                        >
                          <span className="material-symbols-outlined text-sm">mail</span>
                          {submitter.email}
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-on-surface">
                        {event.host_name}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        Submitted by {event.submitted_by_email}
                      </p>
                      <p className="text-xs text-error mt-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        Organizer profile is incomplete
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Edit-request feedback input */}
            {showRejectInput && (
              <section className="bg-tertiary/5 rounded-2xl p-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary mb-3">
                  Feedback for organizer
                </h3>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="What needs to change before this can be approved? (shown to the organizer in the email)"
                  className="w-full bg-white border border-tertiary/20 rounded-xl text-sm p-3 focus:ring-2 focus:ring-tertiary/20 outline-none resize-none"
                />
              </section>
            )}

            {/* Existing rejection reason if already rejected */}
            {event.status === "rejected" && event.rejection_reason && (
              <section className="bg-tertiary/5 rounded-2xl p-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary mb-2">
                  Edits requested
                </h3>
                <p className="text-sm text-tertiary">
                  {event.rejection_reason}
                </p>
              </section>
            )}

            {/* Community flags */}
            {event.flags.length > 0 && (
              <section className="bg-error/5 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-error mb-0.5">
                      Community Reports ({event.openFlagCount} open)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Reported by users. Review and dismiss when handled.
                    </p>
                  </div>
                  {event.openFlagCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResolveFlags}
                      disabled={isPending}
                      className="text-[11px] font-bold text-error border border-error/30 px-3 py-1.5 rounded-full hover:bg-error hover:text-white transition-colors disabled:opacity-50 shrink-0"
                    >
                      Mark all resolved
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {event.flags.map((f) => (
                    <div
                      key={f.id}
                      className={`bg-white rounded-xl p-3 border ${
                        f.resolvedAt ? "border-stone-100 opacity-60" : "border-error/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            f.resolvedAt
                              ? "bg-stone-100 text-stone-400"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          {f.reason}
                        </span>
                        {f.resolvedAt && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            Resolved
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 ml-auto">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {f.message && (
                        <p className="text-xs text-on-surface leading-relaxed">
                          {f.message}
                        </p>
                      )}
                      {f.reporterEmail && (
                        <p className="text-[10px] text-stone-400 mt-1">
                          Reported by: {f.reporterEmail}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-4 md:px-8 py-3 md:py-4 border-t border-stone-100 bg-surface-container-low/50 flex flex-wrap items-center gap-2 justify-end sticky bottom-0">
          {error && (
            <p className="text-xs text-error font-medium w-full md:w-auto md:mr-auto">{error}</p>
          )}

          <a
            href={`/events/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-stone-600 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Public Preview
          </a>

          {event.status === "pending" && !showRejectInput && !confirmDelete && (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={isPending}
                title="Delete permanently — use for spam or inappropriate content"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-stone-500 hover:text-error hover:bg-error/5 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Delete
              </button>
              <button
                onClick={() => {
                  setShowRejectInput(true);
                  setError("");
                }}
                disabled={isPending}
                title="Send the organizer feedback and ask them to update"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold border border-tertiary/30 text-tertiary hover:bg-tertiary hover:text-white transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">edit_note</span>
                Request Edits
              </button>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-primary text-white hover:scale-95 transition-transform disabled:opacity-50"
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                Approve
              </button>
            </>
          )}

          {event.status === "pending" && showRejectInput && (
            <>
              <button
                onClick={() => {
                  setShowRejectInput(false);
                  setReason("");
                  setError("");
                }}
                className="px-4 py-2 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-tertiary text-white hover:scale-95 transition-transform disabled:opacity-50"
              >
                {isPending ? "Sending…" : "Send Feedback"}
              </button>
            </>
          )}

          {confirmDelete && (
            <>
              <span className="text-xs text-error font-medium mr-auto">
                Permanently delete this event? This can&apos;t be undone.
              </span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-error text-white hover:scale-95 transition-transform disabled:opacity-50"
              >
                {isPending ? "Deleting…" : "Confirm Delete"}
              </button>
            </>
          )}

          {event.status === "approved" && (
            <button
              onClick={() => {
                setShowRejectInput(true);
                setError("");
              }}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold border border-error/20 text-error hover:bg-error hover:text-white transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">cancel</span>
              Revoke
            </button>
          )}

          {event.status === "rejected" && (
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-primary text-white hover:scale-95 transition-transform disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">restore</span>
              Re-approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-4">
      <div className="flex items-center gap-2 text-stone-400 mb-1">
        <span className="material-symbols-outlined text-base">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-on-surface">{value}</p>
    </div>
  );
}

function LinkPill({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
      <span className="material-symbols-outlined text-xs text-stone-400">open_in_new</span>
    </a>
  );
}

function StatusBadge({ status }: { status: EventStatus }) {
  const map: Record<EventStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-tertiary", text: "text-white", label: "Pending Review" },
    approved: { bg: "bg-primary", text: "text-white", label: "Approved" },
    rejected: { bg: "bg-error", text: "text-white", label: "Rejected" },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${s.bg} ${s.text} text-[10px] font-black uppercase tracking-widest shadow-md`}
    >
      {s.label}
    </span>
  );
}
