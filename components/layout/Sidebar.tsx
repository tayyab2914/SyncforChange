"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CauseArea, EventType } from "@/types";

const CAUSE_AREAS: CauseArea[] = [
  "Youth",
  "Health",
  "Food Security",
  "Education",
  "Housing",
  "Environment",
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

const CAUSE_COLORS: Record<CauseArea, string> = {
  Youth: "bg-primary/10 text-primary",
  Health: "bg-secondary/10 text-secondary",
  "Food Security": "bg-tertiary/10 text-tertiary",
  Education: "bg-primary/10 text-primary",
  Housing: "bg-secondary/10 text-secondary",
  Environment: "bg-tertiary/10 text-tertiary",
  Seniors: "bg-secondary/10 text-secondary",
  "Arts & Culture": "bg-tertiary/10 text-tertiary",
  "Civic Engagement": "bg-primary/10 text-primary",
  "Animal Welfare": "bg-tertiary/10 text-tertiary",
  Other: "bg-primary/10 text-primary",
};

type FilterCategory = "Cause Area" | "Event Type" | "Location";

const FILTER_CATEGORIES: { label: FilterCategory; icon: string }[] = [
  { label: "Cause Area", icon: "diversity_1" },
  { label: "Event Type", icon: "event_note" },
  { label: "Location", icon: "location_on" },
];

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] =
    useState<FilterCategory>("Cause Area");
  const [locationInput, setLocationInput] = useState(
    searchParams.get("location") ?? ""
  );

  const activeCause = searchParams.get("cause") as CauseArea | null;
  const activeType = searchParams.get("type") as EventType | null;

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`/?${params.toString()}`);
  }

  function toggleCause(cause: CauseArea) {
    navigate({ cause: activeCause === cause ? null : cause });
  }

  function toggleType(type: EventType) {
    navigate({ type: activeType === type ? null : type });
  }

  function applyLocation() {
    navigate({ location: locationInput.trim() || null });
  }

  function clearAll() {
    setLocationInput("");
    router.push("/");
  }

  const hasActiveFilters = activeCause || activeType || searchParams.get("location");

  return (
    <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-5rem)] p-6 bg-[#f6f3f2] rounded-r-3xl hidden lg:flex flex-col z-40 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-[#006c48] font-bold text-lg">Filter Events</h2>
        <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mt-1">
          Find your community
        </p>
      </div>

      {/* Category tabs */}
      <div className="space-y-2">
        {FILTER_CATEGORIES.map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => setActiveCategory(label)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:translate-x-1 transition-transform text-left ${
              activeCategory === label
                ? "bg-white text-[#006c48] shadow-sm"
                : "text-stone-500 hover:bg-stone-200/50"
            }`}
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="text-sm uppercase tracking-widest font-bold">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Filter options */}
      <div className="mt-6 pt-6 border-t border-stone-200 flex-1">
        {activeCategory === "Cause Area" && (
          <div className="flex flex-wrap gap-2">
            {CAUSE_AREAS.map((cause) => (
              <button
                key={cause}
                onClick={() => toggleCause(cause)}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${
                  CAUSE_COLORS[cause]
                } ${activeCause === cause ? "ring-2 ring-current" : ""}`}
              >
                {cause}
              </button>
            ))}
          </div>
        )}

        {activeCategory === "Event Type" && (
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all bg-primary/10 text-primary ${
                  activeType === type ? "ring-2 ring-primary" : ""
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {activeCategory === "Location" && (
          <div className="space-y-3">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                City or Neighborhood
              </span>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyLocation()}
                placeholder="e.g. Brooklyn, Downtown..."
                className="mt-2 w-full bg-surface-container-low border-none rounded-xl text-sm p-3 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </label>
            <button
              onClick={applyLocation}
              className="w-full bg-primary/10 text-primary py-2 rounded-xl font-bold text-xs tracking-wide hover:bg-primary/20 transition-colors"
            >
              Search Location
            </button>
          </div>
        )}
      </div>

      {/* Active filter summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-stone-200 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Active Filters
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeCause && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full flex items-center gap-1">
                {activeCause}
                <button onClick={() => navigate({ cause: null })} aria-label="Remove cause filter">
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            )}
            {activeType && (
              <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full flex items-center gap-1">
                {activeType}
                <button onClick={() => navigate({ type: null })} aria-label="Remove type filter">
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            )}
            {searchParams.get("location") && (
              <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded-full flex items-center gap-1">
                {searchParams.get("location")}
                <button onClick={() => { setLocationInput(""); navigate({ location: null }); }} aria-label="Remove location filter">
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="mt-4 space-y-3">
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="w-full border border-stone-300 text-stone-500 py-2.5 rounded-xl font-bold text-xs tracking-wide hover:bg-stone-100 transition-colors"
          >
            Clear All Filters
          </button>
        )}
        <Link
          href="/admin"
          className="flex items-center gap-2 text-stone-400 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-sm">lock</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Admin Login
          </span>
        </Link>
      </div>
    </aside>
  );
}
