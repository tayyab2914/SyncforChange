"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitEvent, type SubmitEventState } from "@/actions/submitEvent";
import type { CauseArea, EventType } from "@/types";

const CAUSE_AREAS: CauseArea[] = [
  "Health",
  "Education",
  "Environment",
  "Food Security",
  "Housing",
  "Youth",
  "Seniors",
  "Arts & Culture",
  "Civic Engagement",
  "Animal Welfare",
  "Other",
];

const EVENT_TYPES: EventType[] = [
  "Workshop",
  "Community",
  "Fundraiser",
  "Volunteer",
  "Networking",
  "Gala",
  "Conference",
  "Webinar",
  "Other",
];

const FIELD_LABELS: Record<string, string> = {
  title: "Event Name",
  starts_at: "Start Date",
  ends_at: "End Date",
  host_name: "Host Organization",
  description: "Description",
  location_name: "Venue / Location",
  cause_areas: "Cause Areas",
  event_types: "Event Type",
  rsvp_link: "RSVP Link",
  volunteer_link: "Volunteer Link",
  contact_link: "Contact Link",
  hero_image_url: "Hero Image URL",
  total_spots: "Capacity",
};

const INPUT =
  "w-full bg-surface-container-low border-transparent rounded-xl p-4 text-sm transition-all duration-300 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface";

const INPUT_ERR = INPUT + " ring-2 ring-error/30 bg-error/5";

const initialState: SubmitEventState = {};

function SectionHeader({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center space-x-4">
      <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs shrink-0">
        {num}
      </span>
      <h2 className="text-sm font-bold tracking-widest uppercase text-stone-400">
        {label}
      </h2>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-error font-medium mt-1.5">{msg}</p>;
}

export default function EventSubmitForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitEvent, initialState);
  const errorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [selectedCauses, setSelectedCauses] = useState<CauseArea[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [isPhysical, setIsPhysical] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleHeroImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/event", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Upload failed");
      } else {
        setHeroImageUrl(data.url);
      }
    } catch {
      setUploadError("Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Restore form values after server-side validation fails
  useEffect(() => {
    if (!state.values || !formRef.current) return;

    const v = state.values;
    const form = formRef.current;
    const setVal = (name: string, value: string | undefined) => {
      const el = form.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;
      if (el && value !== undefined) el.value = value;
    };

    setVal("title", v.title);
    setVal("subtitle", v.subtitle);
    setVal("description", v.description);
    setVal("starts_at", v.starts_at);
    setVal("ends_at", v.ends_at);
    setVal("host_name", v.host_name);
    setVal("location_name", v.location_name);
    setVal("address", v.address);
    setVal("rsvp_link", v.rsvp_link);
    setVal("volunteer_link", v.volunteer_link);
    setVal("total_spots", v.total_spots);
    setVal("organizer_name", v.organizer_name);
    setVal("organizer_role", v.organizer_role);

    if (v.cause_areas) setSelectedCauses(v.cause_areas as CauseArea[]);
    if (v.event_types) setSelectedTypes(v.event_types as EventType[]);
    if (v.hero_image_url !== undefined) setHeroImageUrl(v.hero_image_url);

    const checkbox = form.elements.namedItem("open_to_collaboration") as HTMLInputElement | null;
    if (checkbox) checkbox.checked = !!v.open_to_collaboration;
  }, [state.values]);

  useEffect(() => {
    if (state.success) {
      router.push("/submit/success");
    }
  }, [state.success, router]);

  useEffect(() => {
    if (state.errors && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.errors]);

  function toggleCause(cause: CauseArea) {
    setSelectedCauses((prev) =>
      prev.includes(cause)
        ? prev.filter((c) => c !== cause)
        : prev.length < 3
        ? [...prev, cause]
        : prev
    );
  }

  function toggleType(type: EventType) {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : prev.length < 2
        ? [...prev, type]
        : prev
    );
  }

  // Build a flat list of error entries to display in the summary
  const errorEntries = state.errors
    ? Object.entries(state.errors)
        .filter(([k]) => k !== "root")
        .flatMap(([key, msgs]) =>
          (msgs ?? []).map((msg) => ({
            field: FIELD_LABELS[key] ?? key,
            msg,
          }))
        )
    : [];

  const errClass = (field: string) => (state.errors?.[field as never] ? INPUT_ERR : INPUT);

  return (
    <>
      {/* Loading overlay */}
      {pending && (
        <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl animate-pulse">
                  send
                </span>
              </div>
            </div>
            <p className="text-base font-bold text-on-surface">Submitting your event…</p>
            <p className="text-xs text-stone-500 text-center">
              Hang tight while we save your submission.
            </p>
          </div>
        </div>
      )}

      {/* Success overlay */}
      {state.success && (
        <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
            </div>
            <p className="text-base font-bold text-on-surface">Submitted!</p>
            <p className="text-xs text-stone-500 text-center">Taking you to your confirmation…</p>
          </div>
        </div>
      )}

      <form ref={formRef} action={action} className="space-y-12">
        {/* Error summary */}
        {state.errors && !state.success && (
          <div
            ref={errorRef}
            className="bg-error/10 text-error rounded-xl p-5 text-sm font-medium"
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
              <p className="font-bold">
                {state.errors.root?.[0] ?? "Please fix the following before submitting:"}
              </p>
            </div>
            {!state.errors.root && errorEntries.length > 0 && (
              <ul className="list-disc list-inside space-y-1 ml-7 text-xs">
                {errorEntries.map((e, i) => (
                  <li key={i}>
                    <span className="font-bold">{e.field}:</span> {e.msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── 01  Event Essentials ── */}
        <section className="space-y-8">
          <SectionHeader num="01" label="Event Essentials" />

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                Event Name <span className="text-error">*</span>
              </label>
              <input
                name="title"
                type="text"
                className={errClass("title")}
                placeholder="A descriptive, engaging title"
                maxLength={150}
                defaultValue={state.values?.title ?? ""}
              />
              <FieldError msg={state.errors?.title?.[0]} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                  Start Date &amp; Time <span className="text-error">*</span>
                </label>
                <input
                  name="starts_at"
                  type="datetime-local"
                  className={errClass("starts_at")}
                  defaultValue={state.values?.starts_at ?? ""}
                />
                <FieldError msg={state.errors?.starts_at?.[0]} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                  End Date &amp; Time
                </label>
                <input
                  name="ends_at"
                  type="datetime-local"
                  className={errClass("ends_at")}
                  defaultValue={state.values?.ends_at ?? ""}
                />
                <FieldError msg={state.errors?.ends_at?.[0]} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                Host Organization <span className="text-error">*</span>
              </label>
              <input
                name="host_name"
                type="text"
                className={errClass("host_name")}
                placeholder="Who is organizing?"
                maxLength={150}
                defaultValue={state.values?.host_name ?? ""}
              />
              <FieldError msg={state.errors?.host_name?.[0]} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                Description <span className="text-error">*</span>
                <span className="text-stone-300 normal-case font-normal tracking-normal ml-1">
                  min 20 characters
                </span>
              </label>
              <textarea
                name="description"
                className={errClass("description")}
                placeholder="Tell the story of this event. What should attendees expect?"
                rows={4}
                maxLength={5000}
                defaultValue={state.values?.description ?? ""}
              />
              <FieldError msg={state.errors?.description?.[0]} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                Tagline{" "}
                <span className="text-stone-300 normal-case font-normal tracking-normal">
                  optional
                </span>
              </label>
              <input
                name="subtitle"
                type="text"
                className={INPUT}
                placeholder="A short line shown on the event card"
                maxLength={300}
                defaultValue={state.values?.subtitle ?? ""}
              />
            </div>
          </div>
        </section>

        {/* ── 02  Details & Reach ── */}
        <section className="space-y-8">
          <SectionHeader num="02" label="Details & Reach" />

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
              <div>
                <span className="font-bold text-on-surface text-sm">
                  Physical Location
                </span>
                <p className="text-xs text-stone-500 mt-0.5">
                  Toggle off for virtual events
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPhysical((v) => !v)}
                className={`w-12 h-6 rounded-full relative flex items-center transition-colors duration-300 ${
                  isPhysical ? "bg-primary" : "bg-stone-300"
                }`}
                aria-label="Toggle physical location"
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute transition-all duration-300 ${
                    isPhysical ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            {isPhysical ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                    Venue Name <span className="text-error">*</span>
                  </label>
                  <input
                    name="location_name"
                    type="text"
                    className={errClass("location_name")}
                    placeholder="e.g. Riverside Community Center"
                    maxLength={200}
                    defaultValue={state.values?.location_name ?? ""}
                  />
                  <FieldError msg={state.errors?.location_name?.[0]} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                    Full Address{" "}
                    <span className="text-stone-300 normal-case font-normal tracking-normal">
                      optional
                    </span>
                  </label>
                  <input
                    name="address"
                    type="text"
                    className={INPUT}
                    placeholder="123 Main St, Brooklyn, NY 11201"
                    maxLength={300}
                    defaultValue={state.values?.address ?? ""}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                  Virtual / Online Location <span className="text-error">*</span>
                </label>
                <input
                  name="location_name"
                  type="text"
                  className={errClass("location_name")}
                  placeholder="e.g. Zoom, Google Meet, or platform name"
                  maxLength={200}
                  defaultValue={state.values?.location_name ?? ""}
                />
                <FieldError msg={state.errors?.location_name?.[0]} />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 ml-1">
                Cause Areas <span className="text-error">*</span>
                <span className="text-stone-300 normal-case font-normal tracking-normal ml-1">
                  pick at least 1, up to 3
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CAUSE_AREAS.map((cause) => {
                  const selected = selectedCauses.includes(cause);
                  const maxed = !selected && selectedCauses.length >= 3;
                  return (
                    <button
                      key={cause}
                      type="button"
                      onClick={() => toggleCause(cause)}
                      disabled={maxed}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                        selected
                          ? "bg-primary text-white"
                          : maxed
                          ? "bg-stone-100 text-stone-300 cursor-not-allowed"
                          : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                      }`}
                    >
                      {cause}
                    </button>
                  );
                })}
              </div>
              {selectedCauses.map((c) => (
                <input key={c} type="hidden" name="cause_areas" value={c} />
              ))}
              <FieldError msg={state.errors?.cause_areas?.[0]} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 ml-1">
                Event Type <span className="text-error">*</span>
                <span className="text-stone-300 normal-case font-normal tracking-normal ml-1">
                  pick at least 1, up to 2
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map((type) => {
                  const selected = selectedTypes.includes(type);
                  const maxed = !selected && selectedTypes.length >= 2;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      disabled={maxed}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                        selected
                          ? "bg-secondary text-white"
                          : maxed
                          ? "bg-stone-100 text-stone-300 cursor-not-allowed"
                          : "bg-secondary/10 text-secondary hover:bg-secondary hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
              {selectedTypes.map((t) => (
                <input key={t} type="hidden" name="event_types" value={t} />
              ))}
              <FieldError msg={state.errors?.event_types?.[0]} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                  RSVP Link{" "}
                  <span className="text-stone-300 normal-case font-normal tracking-normal">
                    optional
                  </span>
                </label>
                <input
                  name="rsvp_link"
                  type="url"
                  className={errClass("rsvp_link")}
                  placeholder="https://eventbrite.com/..."
                  defaultValue={state.values?.rsvp_link ?? ""}
                />
                <FieldError msg={state.errors?.rsvp_link?.[0]} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                  Volunteer Link{" "}
                  <span className="text-stone-300 normal-case font-normal tracking-normal">
                    optional
                  </span>
                </label>
                <input
                  name="volunteer_link"
                  type="url"
                  className={errClass("volunteer_link")}
                  placeholder="https://forms.google.com/..."
                  defaultValue={state.values?.volunteer_link ?? ""}
                />
                <FieldError msg={state.errors?.volunteer_link?.[0]} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                Capacity{" "}
                <span className="text-stone-300 normal-case font-normal tracking-normal">
                  optional — leave blank if unlimited
                </span>
              </label>
              <input
                name="total_spots"
                type="number"
                min={1}
                className={`${INPUT} max-w-[160px]`}
                placeholder="e.g. 50"
                defaultValue={state.values?.total_spots ?? ""}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                  Contact Person{" "}
                  <span className="text-stone-300 normal-case font-normal tracking-normal">
                    optional
                  </span>
                </label>
                <input
                  name="organizer_name"
                  type="text"
                  className={INPUT}
                  placeholder="e.g. Jane Smith"
                  maxLength={150}
                  defaultValue={state.values?.organizer_name ?? ""}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">
                  Role / Title{" "}
                  <span className="text-stone-300 normal-case font-normal tracking-normal">
                    optional
                  </span>
                </label>
                <input
                  name="organizer_role"
                  type="text"
                  className={INPUT}
                  placeholder="e.g. Program Coordinator"
                  maxLength={100}
                  defaultValue={state.values?.organizer_role ?? ""}
                />
              </div>
            </div>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                <input
                  type="checkbox"
                  name="open_to_collaboration"
                  value="on"
                  defaultChecked={!!state.values?.open_to_collaboration}
                  className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="absolute inset-0 border-2 border-primary-container rounded peer-checked:bg-primary peer-checked:border-primary group-hover:bg-primary-container/10 peer-checked:group-hover:bg-primary transition-all" />
                <span className="material-symbols-outlined text-sm text-white relative z-[5] opacity-0 peer-checked:opacity-100 transition-opacity">
                  check
                </span>
              </div>
              <span className="text-sm font-medium text-stone-600">
                Open to partners &amp; collaborators
              </span>
            </label>
          </div>
        </section>

        {/* ── 03  Visual Story ── */}
        <section className="space-y-6">
          <SectionHeader num="03" label="Visual Story" />

          <input type="hidden" name="hero_image_url" value={heroImageUrl} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleHeroImageChange}
            className="hidden"
          />

          {heroImageUrl ? (
            <div className="relative rounded-2xl overflow-hidden bg-surface-container-low">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImageUrl}
                alt="Hero preview"
                className="w-full h-64 object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white animate-spin text-3xl">
                    progress_activity
                  </span>
                </div>
              )}
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-on-surface text-xs font-bold px-3 py-2 rounded-full shadow-md disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => setHeroImageUrl("")}
                  className="inline-flex items-center gap-1.5 bg-white/95 hover:bg-error hover:text-white text-on-surface text-xs font-bold px-3 py-2 rounded-full shadow-md transition-colors"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative w-full border-2 border-dashed border-outline-variant rounded-2xl p-12 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all bg-surface-container-low/30 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-4xl text-primary/40 group-hover:scale-110 transition-transform">
                {uploading ? "progress_activity" : "upload_file"}
              </span>
              <div className="text-center">
                <p className="text-sm font-bold text-stone-600">
                  {uploading ? "Uploading…" : "Upload Event Flyer or Image"}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  JPG, PNG, WebP, or GIF up to 8MB · optional
                </p>
              </div>
            </button>
          )}

          {uploadError && (
            <p className="text-xs text-error font-medium">{uploadError}</p>
          )}
          <FieldError msg={state.errors?.hero_image_url?.[0]} />
        </section>

        {/* Submit */}
        <div className="pt-8 flex flex-col space-y-6">
          <div className="bg-surface-container-high/40 p-4 rounded-xl flex items-start space-x-3">
            <span className="material-symbols-outlined text-primary text-lg shrink-0">
              info
            </span>
            <p className="text-xs font-medium text-stone-500 leading-relaxed">
              By submitting, you agree that this information will be reviewed by
              our curatorial team. We aim to publish within 24–48 hours.
            </p>
          </div>

          <button
            type="submit"
            disabled={pending || state.success}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3"
          >
            {pending ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                Submitting…
              </>
            ) : state.success ? (
              <>
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                Submitted!
              </>
            ) : (
              "Submit for Review"
            )}
          </button>
        </div>
      </form>
    </>
  );
}
