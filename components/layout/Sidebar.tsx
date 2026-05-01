"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "next_30_days", label: "Next 30 Days" },
] as const;

type SectionKey = "cause" | "type" | "date" | "location";

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCause = searchParams.get("cause") as CauseArea | null;
  const activeType = searchParams.get("type") as EventType | null;
  const activeLocation = searchParams.get("location");
  const activeQuery = searchParams.get("q");
  const activeDate = searchParams.get("date");

  const [searchInput, setSearchInput] = useState(activeQuery ?? "");
  const [locationInput, setLocationInput] = useState(activeLocation ?? "");
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    cause: true,
    type: true,
    date: true,
    location: true,
  });

  // Sync inputs if URL changes externally (e.g. user clicks "Clear all")
  useEffect(() => {
    setSearchInput(activeQuery ?? "");
    setLocationInput(activeLocation ?? "");
  }, [activeQuery, activeLocation]);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  function toggleCause(cause: CauseArea) {
    navigate({ cause: activeCause === cause ? null : cause });
  }

  function toggleType(type: EventType) {
    navigate({ type: activeType === type ? null : type });
  }

  function setDateRange(value: string) {
    navigate({ date: activeDate === value ? null : value });
  }

  function applyLocation() {
    navigate({ location: locationInput.trim() || null });
  }

  function applySearch() {
    navigate({ q: searchInput.trim() || null });
  }

  function clearAll() {
    setSearchInput("");
    setLocationInput("");
    router.replace("/", { scroll: false });
  }

  function toggleCollapse(key: SectionKey) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const activeChips: { key: string; label: string; onRemove: () => void; color: string }[] = [];
  if (activeQuery) {
    activeChips.push({
      key: "q",
      label: `"${activeQuery}"`,
      onRemove: () => navigate({ q: null }),
      color: "bg-stone-200 text-stone-700",
    });
  }
  if (activeCause) {
    activeChips.push({
      key: "cause",
      label: activeCause,
      onRemove: () => navigate({ cause: null }),
      color: "bg-primary/10 text-primary",
    });
  }
  if (activeType) {
    activeChips.push({
      key: "type",
      label: activeType,
      onRemove: () => navigate({ type: null }),
      color: "bg-secondary/10 text-secondary",
    });
  }
  if (activeDate) {
    const lbl = DATE_RANGES.find((d) => d.value === activeDate)?.label ?? activeDate;
    activeChips.push({
      key: "date",
      label: lbl,
      onRemove: () => navigate({ date: null }),
      color: "bg-tertiary/10 text-tertiary",
    });
  }
  if (activeLocation) {
    activeChips.push({
      key: "location",
      label: activeLocation,
      onRemove: () => navigate({ location: null }),
      color: "bg-stone-200 text-stone-700",
    });
  }

  const filterCount = activeChips.length;

  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile FAB trigger — sits above the bottom nav on phones */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-20 md:bottom-5 right-5 z-30 flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full shadow-xl shadow-primary/30 hover:scale-95 transition-transform"
        aria-label="Open filters"
      >
        <span className="material-symbols-outlined text-base">tune</span>
        <span className="text-sm font-bold">Filters</span>
        {filterCount > 0 && (
          <span className="bg-white text-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
            {filterCount}
          </span>
        )}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed bg-[#f6f3f2] flex flex-col z-50 border-r border-stone-200/50 transition-transform duration-300
          left-0 top-0 lg:top-16
          h-screen lg:h-[calc(100vh-4rem)]
          w-[88vw] max-w-[320px] lg:w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-stone-200/60 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-on-surface font-bold text-base tracking-tight">
                Filters
              </h2>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mt-0.5">
                {filterCount === 0
                  ? "Browse all events"
                  : `${filterCount} active`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {filterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[10px] font-bold text-stone-500 hover:text-error uppercase tracking-widest"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-stone-200 transition-colors -mr-1"
                aria-label="Close filters"
              >
                <span className="material-symbols-outlined text-stone-500">close</span>
              </button>
            </div>
          </div>

        {/* Search */}
        <div className="relative mt-4">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-stone-400 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            onBlur={applySearch}
            placeholder="Search events…"
            className="w-full bg-white border-none rounded-xl pl-10 pr-3 py-2.5 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                navigate({ q: null });
              }}
              className="absolute right-2 top-2 text-stone-400 hover:text-on-surface"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Active chips */}
      {activeChips.length > 0 && (
        <div className="px-5 py-4 border-b border-stone-200/60 shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {activeChips.map((c) => (
              <span
                key={c.key}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${c.color}`}
              >
                {c.label}
                <button
                  onClick={c.onRemove}
                  aria-label={`Remove ${c.label} filter`}
                  className="hover:opacity-70"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable filter sections — hidden scrollbar */}
      <div className="flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterSection
          icon="diversity_1"
          label="Cause Area"
          collapsed={collapsed.cause}
          onToggle={() => toggleCollapse("cause")}
          activeCount={activeCause ? 1 : 0}
        >
          <div className="flex flex-wrap gap-1.5">
            {CAUSE_AREAS.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={activeCause === c}
                onClick={() => toggleCause(c)}
                tone="primary"
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection
          icon="event_note"
          label="Event Type"
          collapsed={collapsed.type}
          onToggle={() => toggleCollapse("type")}
          activeCount={activeType ? 1 : 0}
        >
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={activeType === t}
                onClick={() => toggleType(t)}
                tone="secondary"
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection
          icon="calendar_today"
          label="When"
          collapsed={collapsed.date}
          onToggle={() => toggleCollapse("date")}
          activeCount={activeDate ? 1 : 0}
        >
          <div className="grid grid-cols-2 gap-1.5">
            {DATE_RANGES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDateRange(d.value)}
                className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-colors text-left ${
                  activeDate === d.value
                    ? "bg-tertiary text-white"
                    : "bg-white text-stone-600 hover:bg-stone-100"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection
          icon="place"
          label="Location"
          collapsed={collapsed.location}
          onToggle={() => toggleCollapse("location")}
          activeCount={activeLocation ? 1 : 0}
        >
          <div className="relative">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyLocation()}
              onBlur={applyLocation}
              placeholder="City, neighborhood, venue…"
              className="w-full bg-white border-none rounded-xl px-3 py-2.5 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {locationInput && (
              <button
                onClick={() => {
                  setLocationInput("");
                  navigate({ location: null });
                }}
                className="absolute right-2 top-2 text-stone-400 hover:text-on-surface"
                aria-label="Clear location"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>
        </FilterSection>
      </div>
    </aside>
    </>
  );
}

function FilterSection({
  icon,
  label,
  collapsed,
  onToggle,
  activeCount,
  children,
}: {
  icon: string;
  label: string;
  collapsed: boolean;
  onToggle: () => void;
  activeCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-stone-200/60 last:border-b-0 py-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 group"
      >
        <span className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-stone-400 text-base">
            {icon}
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-on-surface">
            {label}
          </span>
          {activeCount > 0 && (
            <span className="bg-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </span>
        <span
          className={`material-symbols-outlined text-stone-400 text-base transition-transform ${
            collapsed ? "" : "rotate-180"
          }`}
        >
          expand_more
        </span>
      </button>
      {!collapsed && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
  tone,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  tone: "primary" | "secondary";
}) {
  const baseSelected =
    tone === "primary" ? "bg-primary text-white" : "bg-secondary text-white";
  const baseIdle =
    tone === "primary"
      ? "bg-white text-stone-600 hover:text-primary hover:bg-primary/5 border border-stone-200"
      : "bg-white text-stone-600 hover:text-secondary hover:bg-secondary/5 border border-stone-200";

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
        selected ? baseSelected : baseIdle
      }`}
    >
      {label}
    </button>
  );
}
