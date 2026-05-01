"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveProfileAction, type ProfileState } from "@/actions/profile";
import {
  ORGANIZATION_TYPES,
  CAUSE_FOCUS_OPTIONS,
} from "@/lib/profile/constants";

const INPUT =
  "w-full bg-surface-container-low border-transparent rounded-xl p-3.5 text-sm transition-all duration-300 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface";
const INPUT_ERR = INPUT + " ring-2 ring-error/30 bg-error/5";

const initialState: ProfileState = {};

const FIELD_LABELS: Record<string, string> = {
  displayName: "Display Name",
  organizationType: "Organization Type",
  bio: "About",
  location: "Location",
  website: "Website",
  profileImageUrl: "Profile Image URL",
  causeFocus: "Cause Focus",
};

interface Props {
  initialValues?: {
    displayName?: string | null;
    organizationType?: string | null;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    profileImageUrl?: string | null;
    causeFocus?: string[];
  };
  isFirstTime: boolean;
}

export default function ProfileSetupForm({ initialValues, isFirstTime }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/submit";

  const [state, action, pending] = useActionState(saveProfileAction, initialState);
  const errorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [causeFocus, setCauseFocus] = useState<string[]>(initialValues?.causeFocus ?? []);
  const [profileImageUrl, setProfileImageUrl] = useState(
    initialValues?.profileImageUrl ?? ""
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/profile", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Upload failed");
      } else {
        setProfileImageUrl(data.url);
      }
    } catch {
      setUploadError("Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  useEffect(() => {
    if (state.success) {
      router.push(next);
    }
  }, [state.success, router, next]);

  useEffect(() => {
    if (state.errors && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.errors]);

  // Restore values after a validation failure
  useEffect(() => {
    if (!state.values || !formRef.current) return;
    const v = state.values;
    const f = formRef.current;
    const setVal = (name: string, value: string | undefined) => {
      const el = f.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
        | null;
      if (el && value !== undefined) el.value = value;
    };
    setVal("displayName", v.displayName);
    setVal("organizationType", v.organizationType);
    setVal("bio", v.bio);
    setVal("location", v.location);
    setVal("website", v.website);
    setVal("profileImageUrl", v.profileImageUrl);
    if (v.profileImageUrl !== undefined) setProfileImageUrl(v.profileImageUrl);
    if (v.causeFocus) setCauseFocus(v.causeFocus);
  }, [state.values]);

  function toggleCause(cause: string) {
    setCauseFocus((prev) =>
      prev.includes(cause)
        ? prev.filter((c) => c !== cause)
        : prev.length < 5
        ? [...prev, cause]
        : prev
    );
  }

  const errClass = (field: string) => (state.errors?.[field] ? INPUT_ERR : INPUT);

  const errorEntries = state.errors
    ? Object.entries(state.errors)
        .filter(([k]) => k !== "root")
        .flatMap(([key, msgs]) =>
          (msgs ?? []).map((msg) => ({ field: FIELD_LABELS[key] ?? key, msg }))
        )
    : [];

  return (
    <>
      {/* Loading + success overlays */}
      {pending && (
        <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-3 max-w-sm">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">
              progress_activity
            </span>
            <p className="text-base font-bold">Saving profile…</p>
          </div>
        </div>
      )}
      {state.success && (
        <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-3 max-w-sm">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <p className="text-base font-bold">Profile saved!</p>
            <p className="text-xs text-stone-500">Taking you to your next step…</p>
          </div>
        </div>
      )}

      <form ref={formRef} action={action} className="space-y-8">
        {/* Header */}
        <header>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">
            {isFirstTime ? "One last step" : "Edit your profile"}
          </span>
          <h1 className="text-3xl font-bold text-on-surface mt-2 tracking-tight">
            {isFirstTime ? "Set up your organizer profile" : "Update your profile"}
          </h1>
          <p className="text-stone-500 mt-2 leading-relaxed text-sm max-w-xl">
            {isFirstTime
              ? "Before you can submit events, attendees need to know who you are. Take a minute to fill out the basics — you can edit anytime."
              : "Keep your profile current so attendees can trust your events."}
          </p>
        </header>

        {/* Error summary */}
        {state.errors && !state.success && (
          <div
            ref={errorRef}
            className="bg-error/10 text-error rounded-2xl p-4 text-sm"
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">
                error
              </span>
              <p className="font-bold">
                {state.errors.root?.[0] ?? "Please fix the highlighted fields:"}
              </p>
            </div>
            {!state.errors.root && errorEntries.length > 0 && (
              <ul className="list-disc list-inside ml-7 text-xs space-y-1">
                {errorEntries.map((e, i) => (
                  <li key={i}>
                    <span className="font-bold">{e.field}:</span> {e.msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Profile image */}
        <div className="flex items-start gap-5">
          <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center shrink-0">
            {profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileImageUrl}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-primary text-4xl">
                account_circle
              </span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-white animate-spin">
                  progress_activity
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 pt-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
              Profile Image{" "}
              <span className="text-stone-300 normal-case font-normal tracking-normal">
                optional
              </span>
            </label>

            <input type="hidden" name="profileImageUrl" value={profileImageUrl} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs px-4 py-2 rounded-full transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">
                  {profileImageUrl ? "edit" : "upload"}
                </span>
                {uploading
                  ? "Uploading…"
                  : profileImageUrl
                  ? "Replace image"
                  : "Upload image"}
              </button>

              {profileImageUrl && !uploading && (
                <button
                  type="button"
                  onClick={() => setProfileImageUrl("")}
                  className="inline-flex items-center gap-1 text-stone-500 hover:text-error font-bold text-xs px-3 py-2 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  Remove
                </button>
              )}
            </div>

            {uploadError ? (
              <p className="text-[11px] text-error font-medium mt-2">{uploadError}</p>
            ) : (
              <p className="text-[11px] text-stone-400 mt-2">
                Square images work best. JPG, PNG, WebP, or GIF up to 5MB.
              </p>
            )}
          </div>
        </div>

        {/* Display Name + Org Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
              Display Name <span className="text-error">*</span>
            </label>
            <input
              name="displayName"
              type="text"
              required
              className={errClass("displayName")}
              placeholder="Your name or organization"
              maxLength={120}
              defaultValue={initialValues?.displayName ?? ""}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
              Organization Type <span className="text-error">*</span>
            </label>
            <select
              name="organizationType"
              required
              className={errClass("organizationType")}
              defaultValue={initialValues?.organizationType ?? ""}
            >
              <option value="" disabled>
                Select one…
              </option>
              {ORGANIZATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location + Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
              Location <span className="text-error">*</span>
            </label>
            <input
              name="location"
              type="text"
              required
              className={errClass("location")}
              placeholder="Brooklyn, NY"
              maxLength={120}
              defaultValue={initialValues?.location ?? ""}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
              Website{" "}
              <span className="text-stone-300 normal-case font-normal tracking-normal">
                optional
              </span>
            </label>
            <input
              name="website"
              type="url"
              className={errClass("website")}
              placeholder="https://yourorg.org"
              defaultValue={initialValues?.website ?? ""}
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
            About <span className="text-error">*</span>
            <span className="text-stone-300 normal-case font-normal tracking-normal ml-1">
              min 50 characters
            </span>
          </label>
          <textarea
            name="bio"
            rows={5}
            required
            className={errClass("bio")}
            placeholder="What's your mission? Who do you serve? What kind of events do you run?"
            maxLength={1000}
            defaultValue={initialValues?.bio ?? ""}
          />
        </div>

        {/* Cause focus */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
            Cause Focus <span className="text-error">*</span>
            <span className="text-stone-300 normal-case font-normal tracking-normal ml-1">
              pick at least 1, up to 5
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CAUSE_FOCUS_OPTIONS.map((cause) => {
              const selected = causeFocus.includes(cause);
              const maxed = !selected && causeFocus.length >= 5;
              return (
                <button
                  key={cause}
                  type="button"
                  onClick={() => toggleCause(cause)}
                  disabled={maxed}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
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
          {causeFocus.map((c) => (
            <input key={c} type="hidden" name="causeFocus" value={c} />
          ))}
        </div>

        <button
          type="submit"
          disabled={pending || state.success}
          className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {pending ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg">
                progress_activity
              </span>
              Saving…
            </>
          ) : isFirstTime ? (
            "Save & Continue"
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </>
  );
}
