"use client";

import { useState } from "react";

/* -- Types & Data ------------------------------------------------- */

interface CalendarEvent {
  id: number;
  name: string;
  type: string;
  dates: number[]; // day-of-month numbers
  color: string;
  textColor: string;
  time: string;
  capacity: number;
  registered: number;
  revenue: number;
  aiSuggestion: string;
}

const events: CalendarEvent[] = [
  {
    id: 1,
    name: "Wine Tasting",
    type: "Social",
    dates: [12],
    color: "bg-emerald-50 border-emerald-200",
    textColor: "text-emerald-600",
    time: "6:00 PM - 9:00 PM",
    capacity: 150,
    registered: 120,
    revenue: 18000,
    aiSuggestion:
      "Wine dinner events have 94% attendance rate and $12K avg revenue. Next available Saturday: Nov 9. Auto-create?",
  },
  {
    id: 2,
    name: "Member-Guest Tournament",
    type: "Golf",
    dates: [18, 19],
    color: "bg-amber-50 border-amber-200",
    textColor: "text-amber-700",
    time: "7:00 AM - 5:00 PM",
    capacity: 72,
    registered: 68,
    revenue: 32400,
    aiSuggestion:
      "Tournament is 94% full. Waitlist 6 pairs. Consider adding a second flight on Oct 20 to capture overflow revenue.",
  },
  {
    id: 3,
    name: "Halloween Gala",
    type: "Gala",
    dates: [28],
    color: "bg-purple-50 border-purple-200",
    textColor: "text-purple-600",
    time: "7:00 PM - 11:00 PM",
    capacity: 200,
    registered: 142,
    revenue: 28400,
    aiSuggestion:
      "Last year's Gala sold out 2 weeks early. Current pace suggests sellout by Oct 20. Consider early-bird pricing for remaining seats.",
  },
  {
    id: 4,
    name: "Ladies Luncheon",
    type: "Social",
    dates: [15],
    color: "bg-pink-50 border-pink-200",
    textColor: "text-pink-600",
    time: "11:30 AM - 2:00 PM",
    capacity: 60,
    registered: 48,
    revenue: 4800,
    aiSuggestion:
      "Ladies events drive 2.3x more dining spend in the following week. Consider a post-event wine club sign-up offer.",
  },
];

interface DiningVenue {
  name: string;
  covers: number;
  capacity: number;
  reservations: number;
  note: string;
  icon: string;
}

const diningVenues: DiningVenue[] = [
  {
    name: "The Terrace",
    covers: 42,
    capacity: 60,
    reservations: 8,
    note: "Outdoor seating available",
    icon: "deck",
  },
  {
    name: "The Grill Room",
    covers: 28,
    capacity: 40,
    reservations: 12,
    note: "Chef's special tonight",
    icon: "restaurant",
  },
  {
    name: "The Bar",
    covers: 15,
    capacity: 30,
    reservations: 0,
    note: "Walk-in only",
    icon: "local_bar",
  },
];

/* -- Calendar helpers --------------------------------------------- */

function buildCalendar() {
  // October 2023 starts on Sunday (day 0), 31 days
  const firstDay = 0; // Sunday
  const totalDays = 31;
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= totalDays; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* -- Component ---------------------------------------------------- */

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent>(events[0]);
  const weeks = buildCalendar();

  function getEventsForDay(day: number) {
    return events.filter((e) => e.dates.includes(day));
  }

  const pctFull = Math.round((selectedEvent.registered / selectedEvent.capacity) * 100);

  return (
    <div className="space-y-6">
      {/* -- Section 1: Events Calendar ---------------------------- */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-emerald-500 text-xl">event</span>
          <h2 className="text-lg font-bold text-slate-900">Events Calendar</h2>
        </div>

        <div className="flex gap-4">
          {/* Calendar Grid */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            {/* Month header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">October 2023</h3>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 text-lg">chevron_left</span>
                </button>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1">
                  {week.map((day, di) => {
                    const dayEvents = day ? getEventsForDay(day) : [];
                    return (
                      <div
                        key={di}
                        className={`min-h-[72px] rounded-lg p-1.5 transition-colors ${
                          day ? "bg-slate-50 hover:bg-slate-100" : ""
                        }`}
                      >
                        {day && (
                          <>
                            <span className="text-xs text-slate-500 block mb-1">{day}</span>
                            <div className="space-y-0.5">
                              {dayEvents.map((ev) => (
                                <button
                                  key={ev.id}
                                  onClick={() => setSelectedEvent(ev)}
                                  className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium border truncate ${ev.color} ${ev.textColor} ${
                                    selectedEvent.id === ev.id ? "ring-1 ring-emerald-500/40" : ""
                                  }`}
                                >
                                  {ev.name}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Event Detail Panel */}
          <div className="w-80 shrink-0 bg-[#F8FAFC] rounded-xl border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className={`text-base font-bold ${selectedEvent.textColor}`}>{selectedEvent.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedEvent.type}</p>
            </div>

            <div className="p-4 space-y-4 flex-1">
              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                <div>
                  <p className="text-sm text-slate-700">
                    Oct {selectedEvent.dates.length > 1 ? `${selectedEvent.dates[0]}-${selectedEvent.dates[selectedEvent.dates.length - 1]}` : selectedEvent.dates[0]}, 2023
                  </p>
                  <p className="text-xs text-slate-500">{selectedEvent.time}</p>
                </div>
              </div>

              {/* Capacity */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Capacity</span>
                  <span className="text-xs text-slate-600 font-medium">
                    {selectedEvent.registered}/{selectedEvent.capacity} ({pctFull}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      pctFull >= 90 ? "bg-red-500" : pctFull >= 70 ? "bg-yellow-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${pctFull}%` }}
                  />
                </div>
              </div>

              {/* Revenue Projection */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Revenue Projection</p>
                <p className="text-xl font-bold text-slate-900">
                  ${selectedEvent.revenue.toLocaleString()}
                </p>
              </div>

              {/* AI Suggestion */}
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-emerald-500 text-sm">auto_awesome</span>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">AI Suggestion</p>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedEvent.aiSuggestion}</p>
              </div>

              {/* Register Button */}
              <button className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
                Register Members
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -- Section 2: Today's Dining ----------------------------- */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-emerald-500 text-xl">restaurant</span>
          <h2 className="text-lg font-bold text-slate-900">Today&apos;s Dining</h2>
          <span className="text-xs text-slate-500 ml-2">Tuesday, October 10</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {diningVenues.map((venue) => {
            const pct = Math.round((venue.covers / venue.capacity) * 100);
            const isHigh = pct >= 80;
            return (
              <div
                key={venue.name}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">{venue.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{venue.name}</h3>
                      <p className="text-xs text-slate-400">{venue.note}</p>
                    </div>
                  </div>
                  {isHigh && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-600 border border-yellow-300">
                      Busy
                    </span>
                  )}
                </div>

                {/* Capacity bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Covers</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {venue.covers}/{venue.capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 rounded-full h-2 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Reservations */}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-lg">event_seat</span>
                  <span className="text-sm text-slate-500">
                    {venue.reservations > 0
                      ? `${venue.reservations} reservations tonight`
                      : "Walk-in only"}
                  </span>
                </div>

                {/* Waitlist indicator for high capacity */}
                {pct >= 85 && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200">
                    <span className="material-symbols-outlined text-yellow-500 text-sm">hourglass_top</span>
                    <span className="text-xs text-yellow-600 font-medium">Waitlist active</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
