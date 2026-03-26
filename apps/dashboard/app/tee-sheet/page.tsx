"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const TIMES = Array.from({ length: 25 }, (_, i) => {
  const totalMinutes = 6 * 60 + i * 10; // start at 06:00
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return {
    label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    display: `${h12}:${String(m).padStart(2, "0")} ${ampm}`,
  };
});

const HOLES = Array.from({ length: 10 }, (_, i) => `Hole ${String(i + 1).padStart(2, "0")}`);

type SlotKind = "booked" | "available" | "blocked" | "tournament" | "ai-demand";

interface Slot {
  kind: SlotKind;
  player?: string;
  cart?: boolean;
  caddie?: string;
  label?: string;
  rowSpan?: number;
}

// Build a sparse map: `${timeIdx}-${holeIdx}` → Slot
const SLOT_MAP: Record<string, Slot> = {
  // Booked slots
  "1-0": { kind: "booked", player: "J. Harrington", cart: true, caddie: "Mike" },
  "1-1": { kind: "booked", player: "T. Woods", cart: true, caddie: "Steve" },
  "2-0": { kind: "booked", player: "R. McIlroy", cart: false, caddie: "JP" },
  "3-2": { kind: "booked", player: "P. Mickelson", cart: true },
  "4-3": { kind: "booked", player: "B. DeChambeau", cart: true, caddie: "Tim" },
  "5-1": { kind: "booked", player: "C. Morikawa", cart: false },
  "6-4": { kind: "booked", player: "S. Scheffler", cart: true, caddie: "Ted" },
  "7-0": { kind: "booked", player: "V. Hovland", cart: true },
  "8-5": { kind: "booked", player: "X. Schauffele", cart: false, caddie: "Austin" },
  "10-2": { kind: "booked", player: "W. Clark", cart: true },
  "11-0": { kind: "booked", player: "M. Homa", cart: true, caddie: "Joe" },
  "12-3": { kind: "booked", player: "J. Spieth", cart: false },
  "14-1": { kind: "booked", player: "D. Johnson", cart: true },
  "15-6": { kind: "booked", player: "B. Koepka", cart: true, caddie: "Ricky" },
  "16-0": { kind: "booked", player: "J. Thomas", cart: false },
  "18-4": { kind: "booked", player: "T. Finau", cart: true },
  "20-2": { kind: "booked", player: "S. Burns", cart: true, caddie: "Travis" },
  "22-7": { kind: "booked", player: "W. Zalatoris", cart: false },

  // Blocked — maintenance
  "9-6": { kind: "blocked", label: "Maintenance" },
  "9-7": { kind: "blocked", label: "Maintenance" },
  "9-8": { kind: "blocked", label: "Maintenance" },

  // Tournament block (rows 17-19, holes 5-9)
  "17-5": { kind: "tournament", label: "Invitational Finals", rowSpan: 3 },
  "17-6": { kind: "tournament", label: "", rowSpan: 3 },
  "17-7": { kind: "tournament", label: "", rowSpan: 3 },
  "17-8": { kind: "tournament", label: "", rowSpan: 3 },
  "17-9": { kind: "tournament", label: "", rowSpan: 3 },
  // hide spanned rows
  "18-5": { kind: "tournament", label: "", rowSpan: 0 },
  "18-6": { kind: "tournament", label: "", rowSpan: 0 },
  "18-7": { kind: "tournament", label: "", rowSpan: 0 },
  "18-8": { kind: "tournament", label: "", rowSpan: 0 },
  "18-9": { kind: "tournament", label: "", rowSpan: 0 },
  "19-5": { kind: "tournament", label: "", rowSpan: 0 },
  "19-6": { kind: "tournament", label: "", rowSpan: 0 },
  "19-7": { kind: "tournament", label: "", rowSpan: 0 },
  "19-8": { kind: "tournament", label: "", rowSpan: 0 },
  "19-9": { kind: "tournament", label: "", rowSpan: 0 },

  // AI high demand
  "6-0": { kind: "ai-demand", label: "Peak Demand +15%" },
  "6-1": { kind: "ai-demand", label: "Peak Demand +15%" },
  "6-2": { kind: "ai-demand", label: "Peak Demand +15%" },
  "6-3": { kind: "ai-demand", label: "Peak Demand +15%" },
  "7-1": { kind: "ai-demand", label: "Peak Demand +15%" },
  "7-2": { kind: "ai-demand", label: "Peak Demand +15%" },
};

/* ------------------------------------------------------------------ */
/*  Selected Tee Time Detail (sidebar)                                 */
/* ------------------------------------------------------------------ */

const SELECTED = {
  time: "07:00 AM",
  date: "October 24, 2023",
  hole: "Hole 01",
  weather: "75\u00B0F Sunny",
  aiStrategy: "High demand detected. Recommended: Dynamic Pricing +15%",
  players: [
    { initials: "JH", name: "James Harrington", membership: "VIP" },
    { initials: "TW", name: "Thomas Wilson", membership: "Premium" },
    { initials: "RM", name: "Robert Mitchell", membership: "Guest" },
    { initials: "PG", name: "Patricia Greene", membership: "Standard" },
  ],
  fees: { cart: 70, guestGreens: 370, total: 440 },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TeeSheetPage() {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [dynamicPricing, setDynamicPricing] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-white text-slate-800 font-sans overflow-hidden">
      {/* ---- Top controls bar ---- */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 shrink-0">
        <h1 className="text-xl font-semibold text-emerald-500 mr-4">Tee Sheet</h1>

        {/* Day / Week toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {(["day", "week"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                viewMode === mode
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-slate-500 hover:text-slate-800"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-gray-200">
          <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_today</span>
          <span className="text-xs text-slate-700">October 24, 2023</span>
        </div>

        {/* Dynamic Pricing toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-500">Dynamic Pricing</span>
          <button
            onClick={() => setDynamicPricing(!dynamicPricing)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              dynamicPricing ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                dynamicPricing ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {/* Lottery button */}
        <button className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#D4A843] text-white hover:bg-[#c49a3a] transition-colors">
          Lottery
        </button>
      </div>

      {/* ---- Main content ---- */}
      <div className="flex flex-1 overflow-hidden">
        {/* ---- LEFT: Time column + Grid ---- */}
        <div className="flex flex-1 overflow-auto">
          {/* Time column */}
          <div className="w-20 shrink-0 sticky left-0 z-10 bg-white">
            {/* header spacer */}
            <div className="h-10 border-b border-gray-200" />
            {TIMES.map((t) => (
              <div
                key={t.label}
                className="h-12 flex items-center justify-end pr-3 text-[10px] text-slate-500 border-b border-gray-100"
              >
                {t.display}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-x-auto">
            {/* Hole headers */}
            <div className="flex sticky top-0 z-10 bg-[#F8FAFC] border-b border-gray-200">
              {HOLES.map((h) => (
                <div
                  key={h}
                  className="flex-1 min-w-[110px] h-10 flex items-center justify-center text-[10px] font-medium text-slate-500 uppercase tracking-wider"
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {TIMES.map((t, tIdx) => (
              <div key={t.label} className="flex">
                {HOLES.map((_, hIdx) => {
                  const key = `${tIdx}-${hIdx}`;
                  const slot = SLOT_MAP[key];

                  // Skip cells consumed by rowSpan
                  if (slot?.rowSpan === 0) return null;

                  const baseClass =
                    "flex-1 min-w-[110px] h-12 border-b border-r border-gray-100 flex items-center justify-center text-[9px] px-1 relative";

                  if (!slot || slot.kind === "available") {
                    return (
                      <div
                        key={key}
                        className={`${baseClass} bg-white group cursor-pointer hover:bg-emerald-50`}
                      >
                        <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Book Slot
                        </span>
                      </div>
                    );
                  }

                  if (slot.kind === "booked") {
                    return (
                      <div key={key} className={`${baseClass} bg-emerald-500 text-white`}>
                        <div className="flex items-center gap-1 truncate">
                          {slot.cart && (
                            <span className="material-symbols-outlined text-[12px]">
                              directions_car
                            </span>
                          )}
                          <span className="truncate font-medium">{slot.player}</span>
                          {slot.caddie && (
                            <span className="text-emerald-100 truncate">({slot.caddie})</span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (slot.kind === "blocked") {
                    return (
                      <div key={key} className={`${baseClass} bg-red-50 border border-red-200 text-red-500`}>
                        {slot.label}
                      </div>
                    );
                  }

                  if (slot.kind === "tournament") {
                    const span = slot.rowSpan ?? 1;
                    return (
                      <div
                        key={key}
                        className="flex-1 min-w-[110px] border-r border-gray-100 flex items-center justify-center text-[9px] px-1 bg-amber-50 border border-amber-200 text-amber-800 font-semibold"
                        style={{ height: `${span * 48}px` }}
                      >
                        {slot.label}
                      </div>
                    );
                  }

                  if (slot.kind === "ai-demand") {
                    return (
                      <div
                        key={key}
                        className={`${baseClass} bg-emerald-50 border border-emerald-200 text-emerald-600`}
                      >
                        <span className="material-symbols-outlined text-[10px] mr-0.5">
                          trending_up
                        </span>
                        {slot.label}
                      </div>
                    );
                  }

                  return <div key={key} className={baseClass} />;
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ---- RIGHT: Sidebar ---- */}
        <div className="w-80 shrink-0 border-l border-gray-200 bg-[#F8FAFC] overflow-y-auto p-5 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-slate-700">Selected Tee Time</h2>

          {/* Time / Date / Hole */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-[18px]">
                schedule
              </span>
              <span className="text-sm font-medium text-slate-800">{SELECTED.time}</span>
            </div>
            <p className="text-[11px] text-slate-500 ml-6">{SELECTED.date}</p>
            <p className="text-[11px] text-slate-500 ml-6">{SELECTED.hole}</p>
          </div>

          {/* Weather */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
            {SELECTED.weather}
          </div>

          {/* AI Yield Strategy */}
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="material-symbols-outlined text-emerald-500 text-[16px]">
                auto_awesome
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">AI Yield Strategy</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{SELECTED.aiStrategy}</p>
          </div>

          {/* Group */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Group
            </h3>
            <div className="space-y-2">
              {SELECTED.players.map((p) => (
                <div key={p.initials} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-500">
                    {p.initials}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-500">{p.membership}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fees */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Cart Fee</span>
              <span>${SELECTED.fees.cart}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Guest Greens Fee</span>
              <span>${SELECTED.fees.guestGreens}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-slate-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${SELECTED.fees.total}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <button className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Modify
            </button>
            <button className="flex-1 py-2 rounded-lg bg-emerald-500 text-xs font-medium text-white hover:bg-emerald-600 transition-colors">
              Check-In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
