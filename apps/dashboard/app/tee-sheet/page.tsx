"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  membership_type: string;
  member_number: string;
}

interface Booking {
  id: string;
  tee_time_id: string;
  member_id: string | null;
  guest_name: string | null;
  is_guest: boolean;
  player_number: number;
  cart_type: string;
  checked_in: boolean;
  green_fee: number;
  cart_fee: number;
  guest_fee: number;
  members?: Member;
}

interface TeeTime {
  id: string;
  tee_date: string;
  tee_time: string;
  hole_start: number;
  status: string;
  max_players: number;
  green_fee: number;
  cart_fee: number;
  notes: string | null;
  tee_time_bookings: Booking[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(t: string): string {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m} ${ampm}`;
}

function getInitials(first: string, last: string): string {
  return `${first[0] || ""}${last[0] || ""}`.toUpperCase();
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function currentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TeeSheetPage() {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TeeTime | null>(null);
  const [filterHole, setFilterHole] = useState<"all" | "front" | "back">("all");

  // Fetch tee times with bookings joined
  useEffect(() => {
    async function fetchTeeTimes() {
      setLoading(true);
      const { data, error } = await supabase
        .from("tee_times")
        .select(`
          *,
          tee_time_bookings (
            *,
            members (id, first_name, last_name, membership_type, member_number)
          )
        `)
        .eq("tee_date", selectedDate)
        .order("tee_time", { ascending: true });

      if (error) {
        console.error("Error fetching tee times:", error);
      } else {
        setTeeTimes((data as TeeTime[]) || []);
      }
      setLoading(false);
    }
    fetchTeeTimes();
  }, [selectedDate]);

  // Split tee times by hole_start
  const tee1Slots = useMemo(
    () => teeTimes.filter((t) => t.hole_start === 1),
    [teeTimes]
  );
  const tee10Slots = useMemo(
    () => teeTimes.filter((t) => t.hole_start === 10),
    [teeTimes]
  );

  // Stats
  const bookedCount = teeTimes.filter((t) => t.status === "booked").length;
  const totalSlots = teeTimes.length || 1;
  const bookedPct = Math.round((bookedCount / totalSlots) * 100);
  const totalRevenue = teeTimes
    .filter((t) => t.status === "booked")
    .reduce((sum, t) => {
      const bookingRevenue = t.tee_time_bookings.reduce(
        (bs, b) => bs + Number(b.green_fee || 0) + Number(b.cart_fee || 0) + Number(b.guest_fee || 0),
        0
      );
      return sum + bookingRevenue;
    }, 0);
  const cartsOut = teeTimes
    .filter((t) => t.status === "booked")
    .reduce((sum, t) => {
      return sum + t.tee_time_bookings.filter((b) => b.cart_type === "riding").length;
    }, 0);

  // Current time indicator position
  const nowMin = currentTimeMinutes();

  // Determine which columns to show based on filter
  const showTee1 = filterHole === "all" || filterHole === "front";
  const showTee10 = filterHole === "all" || filterHole === "back";

  // Date navigation
  function shiftDate(days: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  }

  function formatDisplayDate(dateStr: string): string {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f7f9fb] text-slate-800 font-sans overflow-hidden -m-4 md:-m-6">
      {/* ---- Top controls bar ---- */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-200 shrink-0 flex-wrap">
        <h1 className="text-lg font-semibold text-slate-800 mr-2">Tee Sheet</h1>

        {/* Date picker with arrows */}
        <div className="flex items-center gap-1 bg-slate-50 rounded-lg border border-gray-200">
          <button
            onClick={() => shiftDate(-1)}
            className="px-2 py-1.5 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <span className="text-xs font-medium text-slate-700 px-1 min-w-[160px] text-center">
            {formatDisplayDate(selectedDate)}
          </span>
          <button
            onClick={() => shiftDate(1)}
            className="px-2 py-1.5 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>

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

        {/* Filter pills */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {([
            ["all", "All Holes"],
            ["front", "Front 9"],
            ["back", "Back 9"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterHole(key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filterHole === key
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Weather widget */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-1">
          <span className="material-symbols-outlined text-[16px] text-amber-400">wb_sunny</span>
          <span>75°F Sunny</span>
        </div>

        {/* New Booking button */}
        <button className="ml-auto px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Booking
        </button>
      </div>

      {/* ---- Main content ---- */}
      <div className="flex flex-1 overflow-hidden">
        {/* ---- LEFT: Grid ---- */}
        <div className="flex-1 overflow-auto relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-slate-400">Loading tee times...</div>
            </div>
          ) : teeTimes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">calendar_month</span>
                <p className="text-sm text-slate-400">No tee times for this date</p>
              </div>
            </div>
          ) : (
            <div className="min-w-[600px]">
              {/* Column headers */}
              <div className="flex sticky top-0 z-20 bg-[#f7f9fb] border-b border-gray-200">
                <div className="w-20 shrink-0 h-10 flex items-center justify-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Time
                </div>
                {showTee1 && (
                  <div className="flex-1 h-10 flex items-center justify-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-l border-gray-200">
                    Tee #1 — Front 9
                  </div>
                )}
                {showTee10 && (
                  <div className="flex-1 h-10 flex items-center justify-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-l border-gray-200">
                    Tee #10 — Back 9
                  </div>
                )}
              </div>

              {/* Time rows — use unique times across both columns */}
              {(() => {
                const allTimes = [
                  ...new Set([
                    ...tee1Slots.map((t) => t.tee_time),
                    ...tee10Slots.map((t) => t.tee_time),
                  ]),
                ].sort();

                const tee1Map = Object.fromEntries(tee1Slots.map((t) => [t.tee_time, t]));
                const tee10Map = Object.fromEntries(tee10Slots.map((t) => [t.tee_time, t]));

                return allTimes.map((time) => {
                  const [hStr, mStr] = time.split(":");
                  const slotMin = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
                  const isCurrentTime = Math.abs(nowMin - slotMin) < 5;
                  const slot1 = tee1Map[time];
                  const slot10 = tee10Map[time];

                  return (
                    <div key={time} className="flex relative">
                      {/* Current time indicator */}
                      {isCurrentTime && (
                        <div className="absolute left-0 right-0 top-1/2 z-10 pointer-events-none">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />
                            <div className="flex-1 h-[2px] bg-emerald-500" />
                          </div>
                        </div>
                      )}

                      {/* Time label */}
                      <div className="w-20 shrink-0 h-16 flex items-center justify-end pr-3 text-[11px] font-medium text-slate-400 border-b border-gray-100">
                        {formatTime(time)}
                      </div>

                      {/* Tee #1 slot */}
                      {showTee1 && (
                        <div className="flex-1 border-l border-gray-200">
                          {slot1 ? (
                            <SlotCell
                              slot={slot1}
                              isSelected={selectedSlot?.id === slot1.id}
                              onClick={() => setSelectedSlot(slot1.status === "booked" ? slot1 : null)}
                            />
                          ) : (
                            <div className="h-16 border-b border-gray-100" />
                          )}
                        </div>
                      )}

                      {/* Tee #10 slot */}
                      {showTee10 && (
                        <div className="flex-1 border-l border-gray-200">
                          {slot10 ? (
                            <SlotCell
                              slot={slot10}
                              isSelected={selectedSlot?.id === slot10.id}
                              onClick={() => setSelectedSlot(slot10.status === "booked" ? slot10 : null)}
                            />
                          ) : (
                            <div className="h-16 border-b border-gray-100" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* ---- RIGHT: Detail panel ---- */}
        <div className="w-96 shrink-0 border-l border-gray-200 bg-white overflow-y-auto hidden lg:flex flex-col">
          {selectedSlot ? (
            <div className="p-5 flex flex-col gap-4 flex-1">
              <h2 className="text-sm font-semibold text-slate-700">Tee Time Details</h2>

              {/* Time / Date */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-[18px]">schedule</span>
                  <span className="text-sm font-medium text-slate-800">
                    {formatTime(selectedSlot.tee_time)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 ml-6">
                  {formatDisplayDate(selectedSlot.tee_date)}
                </p>
                <p className="text-[11px] text-slate-500 ml-6">
                  Tee #{selectedSlot.hole_start} — {selectedSlot.hole_start === 1 ? "Front 9" : "Back 9"}
                </p>
              </div>

              {/* Player list */}
              <div>
                <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Players ({selectedSlot.tee_time_bookings.length}/{selectedSlot.max_players})
                </h3>
                <div className="space-y-2">
                  {selectedSlot.tee_time_bookings.map((b) => {
                    const member = b.members as unknown as Member | undefined;
                    const name = b.is_guest
                      ? b.guest_name || "Guest"
                      : member
                        ? `${member.first_name} ${member.last_name}`
                        : "Unknown";
                    const initials = b.is_guest
                      ? "G"
                      : member
                        ? getInitials(member.first_name, member.last_name)
                        : "?";
                    const memberType = b.is_guest
                      ? "Guest"
                      : member?.membership_type || "";

                    return (
                      <div key={b.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{name}</p>
                          <p className="text-[10px] text-slate-500">{memberType}</p>
                        </div>
                        {b.cart_type === "riding" && (
                          <span className="material-symbols-outlined text-[14px] text-slate-400">
                            directions_car
                          </span>
                        )}
                        {b.checked_in && (
                          <span className="material-symbols-outlined text-[14px] text-emerald-500">
                            check_circle
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fee breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                {(() => {
                  const greenTotal = selectedSlot.tee_time_bookings.reduce(
                    (s, b) => s + Number(b.green_fee || 0),
                    0
                  );
                  const cartTotal = selectedSlot.tee_time_bookings.reduce(
                    (s, b) => s + Number(b.cart_fee || 0),
                    0
                  );
                  const guestTotal = selectedSlot.tee_time_bookings.reduce(
                    (s, b) => s + Number(b.guest_fee || 0),
                    0
                  );
                  const total = greenTotal + cartTotal + guestTotal;
                  return (
                    <>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Green Fees</span>
                        <span>${greenTotal}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Cart Fees</span>
                        <span>${cartTotal}</span>
                      </div>
                      {guestTotal > 0 && (
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Guest Fees</span>
                          <span>${guestTotal}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-semibold text-slate-900 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>${total}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Notes */}
              {selectedSlot.notes && (
                <div>
                  <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</h3>
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3">{selectedSlot.notes}</p>
                </div>
              )}

              {/* Notes textarea */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                  Add Note
                </label>
                <textarea
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  placeholder="Add a note..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-4">
                <button className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-xs font-medium text-white hover:bg-emerald-600 transition-colors">
                  Check In
                </button>
                <button className="flex-1 py-2.5 rounded-lg border border-gray-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Edit
                </button>
              </div>
              <button className="w-full py-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Cancel Booking
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-5">
              <div className="text-center">
                <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">touch_app</span>
                <p className="text-sm text-slate-400">Select a booked tee time</p>
                <p className="text-[11px] text-slate-300 mt-1">Click a slot to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Bottom status bar ---- */}
      <div className="flex items-center gap-6 px-5 py-2.5 bg-white border-t border-gray-200 shrink-0">
        {/* Booked progress */}
        <div className="flex items-center gap-3">
          <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${bookedPct}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">{bookedCount}/{totalSlots}</span> booked ({bookedPct}%)
          </span>
        </div>

        {/* Revenue */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="material-symbols-outlined text-[14px] text-emerald-500">payments</span>
          <span className="font-semibold text-slate-700">${totalRevenue.toLocaleString()}</span>
          revenue
        </div>

        {/* Carts */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="material-symbols-outlined text-[14px] text-slate-400">directions_car</span>
          <span className="font-semibold text-slate-700">{cartsOut}</span>
          carts out
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          <span className="text-[11px] font-medium text-emerald-600">Live</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Slot Cell component                                                */
/* ------------------------------------------------------------------ */

function SlotCell({
  slot,
  isSelected,
  onClick,
}: {
  slot: TeeTime;
  isSelected: boolean;
  onClick: () => void;
}) {
  const bookings = slot.tee_time_bookings || [];
  const playerCount = bookings.length;
  const hasCart = bookings.some((b) => b.cart_type === "riding");

  // First player name
  const firstBooking = bookings[0];
  const firstMember = firstBooking?.members as unknown as Member | undefined;
  const playerName = firstBooking
    ? firstBooking.is_guest
      ? firstBooking.guest_name || "Guest"
      : firstMember
        ? `${firstMember.first_name} ${firstMember.last_name}`
        : "Member"
    : "";

  if (slot.status === "booked") {
    return (
      <div
        onClick={onClick}
        className={`h-16 border-b border-gray-100 flex items-center px-3 cursor-pointer transition-all
          bg-emerald-50 border-l-4 border-l-emerald-500
          ${isSelected ? "ring-2 ring-emerald-500/20 border-2 border-emerald-500" : "hover:bg-emerald-100/60"}
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-800 truncate">{playerName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {playerCount > 1 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                  {playerCount}
                </span>
              )}
              {hasCart && (
                <span className="material-symbols-outlined text-[12px] text-emerald-600">
                  directions_car
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slot.status === "available") {
    return (
      <div className="h-16 border-b border-gray-100 flex items-center justify-center bg-[#f0f2f5] hover:bg-emerald-50 cursor-pointer transition-colors group">
        <span className="text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          + Book
        </span>
      </div>
    );
  }

  if (slot.status === "blocked" || slot.status === "maintenance") {
    return (
      <div className="h-16 border-b border-gray-100 flex items-center justify-center bg-red-50 border-l-4 border-l-red-400">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px] text-red-400">block</span>
          <span className="text-[10px] text-red-500 font-medium">
            {slot.notes || (slot.status === "maintenance" ? "Maintenance" : "Blocked")}
          </span>
        </div>
      </div>
    );
  }

  // Default / unknown status
  return <div className="h-16 border-b border-gray-100 bg-slate-50" />;
}
