"use client";

import { useState } from "react";

/* -- Mock Data ---------------------------------------------------- */

type RiskLevel = "low" | "medium" | "high";

interface Member {
  id: number;
  name: string;
  initials: string;
  membership: string;
  risk: RiskLevel;
  memberSince: string;
  nps: number;
  lifetimeSpend: number;
  annualSpend: number;
  visitFreq: string;
  recentActivity: { icon: string; text: string; time: string }[];
  monthlyVisits: number[];
}

const members: Member[] = [
  {
    id: 1,
    name: "William Sterling",
    initials: "WS",
    membership: "Executive",
    risk: "low",
    memberSince: "2016",
    nps: 92,
    lifetimeSpend: 142800,
    annualSpend: 18400,
    visitFreq: "3.2/week",
    recentActivity: [
      { icon: "login", text: "Checked in — Main Clubhouse", time: "Today, 8:14 AM" },
      { icon: "restaurant", text: "Dining — The Grill Room, $142", time: "Yesterday, 7:30 PM" },
      { icon: "golf_course", text: "Tee Time — 18 holes, foursome", time: "Mar 23, 7:00 AM" },
      { icon: "event", text: "RSVP — Wine Tasting Event", time: "Mar 21" },
      { icon: "fitness_center", text: "Fitness Center check-in", time: "Mar 20, 6:45 AM" },
    ],
    monthlyVisits: [14, 12, 15, 10, 13, 16, 14, 11, 15, 13, 12, 14],
  },
  {
    id: 2,
    name: "Dr. Sarah Jenkins",
    initials: "SJ",
    membership: "Platinum",
    risk: "low",
    memberSince: "2018",
    nps: 88,
    lifetimeSpend: 98200,
    annualSpend: 14600,
    visitFreq: "2.8/week",
    recentActivity: [
      { icon: "restaurant", text: "Dining — The Terrace, $98", time: "Today, 12:30 PM" },
      { icon: "golf_course", text: "Tee Time — 9 holes", time: "Yesterday, 3:00 PM" },
      { icon: "spa", text: "Spa appointment", time: "Mar 22" },
      { icon: "login", text: "Checked in — Pool Area", time: "Mar 21" },
      { icon: "event", text: "RSVP — Ladies Luncheon", time: "Mar 20" },
    ],
    monthlyVisits: [11, 10, 12, 9, 11, 13, 12, 10, 11, 12, 11, 12],
  },
  {
    id: 3,
    name: "Michael Lane",
    initials: "ML",
    membership: "Gold",
    risk: "high",
    memberSince: "2019",
    nps: 34,
    lifetimeSpend: 52400,
    annualSpend: 6200,
    visitFreq: "0.4/week",
    recentActivity: [
      { icon: "login", text: "Checked in — Pro Shop", time: "Mar 8" },
      { icon: "restaurant", text: "Dining — The Bar, $38", time: "Feb 28" },
      { icon: "golf_course", text: "Tee Time — 18 holes", time: "Feb 14" },
      { icon: "email", text: "Opened renewal reminder email", time: "Feb 10" },
      { icon: "login", text: "Checked in — Fitness Center", time: "Jan 30" },
    ],
    monthlyVisits: [8, 7, 6, 5, 4, 3, 3, 2, 2, 1, 1, 1],
  },
  {
    id: 4,
    name: "Patricia Howard",
    initials: "PH",
    membership: "Social",
    risk: "medium",
    memberSince: "2020",
    nps: 62,
    lifetimeSpend: 31600,
    annualSpend: 8400,
    visitFreq: "1.5/week",
    recentActivity: [
      { icon: "restaurant", text: "Dining — The Terrace, $76", time: "Today, 1:15 PM" },
      { icon: "event", text: "Attended — Book Club meeting", time: "Mar 22" },
      { icon: "login", text: "Checked in — Main Clubhouse", time: "Mar 20" },
      { icon: "restaurant", text: "Dining — The Grill Room, $112", time: "Mar 18" },
      { icon: "event", text: "RSVP — Halloween Gala", time: "Mar 16" },
    ],
    monthlyVisits: [6, 7, 5, 6, 8, 7, 5, 6, 7, 6, 5, 6],
  },
  {
    id: 5,
    name: "Robert Whitlock",
    initials: "RW",
    membership: "Gold",
    risk: "low",
    memberSince: "2017",
    nps: 85,
    lifetimeSpend: 118600,
    annualSpend: 16200,
    visitFreq: "2.5/week",
    recentActivity: [
      { icon: "golf_course", text: "Tee Time — 18 holes, twosome", time: "Today, 6:30 AM" },
      { icon: "restaurant", text: "Dining — The Grill Room, $88", time: "Yesterday" },
      { icon: "login", text: "Checked in — Pro Shop", time: "Mar 23" },
      { icon: "fitness_center", text: "Fitness Center check-in", time: "Mar 22" },
      { icon: "golf_course", text: "Tee Time — 9 holes", time: "Mar 21" },
    ],
    monthlyVisits: [10, 11, 10, 9, 10, 12, 11, 10, 11, 10, 10, 11],
  },
  {
    id: 6,
    name: "James Chen",
    initials: "JC",
    membership: "Executive",
    risk: "low",
    memberSince: "2015",
    nps: 95,
    lifetimeSpend: 210400,
    annualSpend: 24800,
    visitFreq: "4.1/week",
    recentActivity: [
      { icon: "golf_course", text: "Tee Time — 18 holes, foursome", time: "Today, 7:00 AM" },
      { icon: "restaurant", text: "Dining — The Terrace, $220", time: "Today, 12:00 PM" },
      { icon: "login", text: "Checked in — Main Clubhouse", time: "Yesterday" },
      { icon: "event", text: "Hosted — Member-Guest Tournament", time: "Mar 22" },
      { icon: "spa", text: "Spa appointment", time: "Mar 21" },
    ],
    monthlyVisits: [16, 15, 17, 14, 16, 18, 17, 15, 16, 17, 16, 18],
  },
  {
    id: 7,
    name: "Linda Morrison",
    initials: "LM",
    membership: "Platinum",
    risk: "medium",
    memberSince: "2019",
    nps: 58,
    lifetimeSpend: 68400,
    annualSpend: 10200,
    visitFreq: "1.8/week",
    recentActivity: [
      { icon: "restaurant", text: "Dining — The Bar, $54", time: "Mar 22" },
      { icon: "login", text: "Checked in — Pool Area", time: "Mar 19" },
      { icon: "event", text: "Cancelled — Ladies Luncheon RSVP", time: "Mar 17" },
      { icon: "restaurant", text: "Dining — The Terrace, $66", time: "Mar 14" },
      { icon: "login", text: "Checked in — Main Clubhouse", time: "Mar 10" },
    ],
    monthlyVisits: [8, 9, 7, 8, 7, 6, 7, 8, 7, 6, 7, 7],
  },
  {
    id: 8,
    name: "David Thompson",
    initials: "DT",
    membership: "Gold",
    risk: "high",
    memberSince: "2020",
    nps: 28,
    lifetimeSpend: 38200,
    annualSpend: 4800,
    visitFreq: "0.2/week",
    recentActivity: [
      { icon: "email", text: "Opened renewal reminder email", time: "Mar 15" },
      { icon: "login", text: "Checked in — Pro Shop", time: "Feb 20" },
      { icon: "golf_course", text: "Tee Time — 9 holes", time: "Feb 5" },
      { icon: "restaurant", text: "Dining — The Grill Room, $64", time: "Jan 22" },
      { icon: "login", text: "Checked in — Main Clubhouse", time: "Jan 10" },
    ],
    monthlyVisits: [6, 5, 4, 3, 3, 2, 2, 1, 1, 1, 0, 0],
  },
];

type FilterType = "all" | "vip" | "at-risk" | "new";

const riskColor: Record<RiskLevel, string> = {
  low: "bg-emerald-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

const riskLabel: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "HIGH RISK",
};

const riskTextColor: Record<RiskLevel, string> = {
  low: "text-emerald-500",
  medium: "text-yellow-500",
  high: "text-red-500",
};

/* -- Helpers ------------------------------------------------------ */

function fmt(n: number) {
  return "$" + n.toLocaleString();
}

/* -- Component ---------------------------------------------------- */

export default function MembersPage() {
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const filtered = members.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "vip") return m.membership === "Executive" || m.membership === "Platinum";
    if (filter === "at-risk") return m.risk === "high";
    if (filter === "new") return parseInt(m.memberSince) >= 2020;
    return true;
  });

  const selected = members.find((m) => m.id === selectedId) ?? members[0];
  const maxVisit = Math.max(...selected.monthlyVisits);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "vip", label: "VIP" },
    { key: "at-risk", label: "At Risk" },
    { key: "new", label: "New" },
  ];

  const tabs = ["Overview", "Activity", "Spending", "Feedback", "Communications"];

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* -- Left Panel: Member List -------------------------------- */}
      <div className="w-80 shrink-0 bg-[#F8FAFC] rounded-xl border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
            <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none w-full"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 p-3 border-b border-gray-200">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-emerald-50 text-emerald-500 border border-emerald-200"
                  : "bg-white text-slate-500 border border-gray-200 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Member Cards */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                selectedId === m.id
                  ? "bg-white border-l-4 border-emerald-500 shadow-sm"
                  : "hover:bg-slate-50 border-l-4 border-transparent"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-emerald-500">{m.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{m.name}</p>
                <p className="text-xs text-slate-500">{m.membership}</p>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${riskColor[m.risk]}`} title={riskLabel[m.risk]} />
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No members match filter</p>
          )}
        </div>
      </div>

      {/* -- Center Panel: Member Detail ---------------------------- */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <span className="text-lg font-bold text-emerald-500">{selected.initials}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selected.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    selected.membership === "Executive"
                      ? "bg-[#D4A843]/20 text-[#D4A843] border border-[#D4A843]/30"
                      : selected.membership === "Platinum"
                      ? "bg-slate-200 text-slate-600 border border-slate-300"
                      : selected.membership === "Gold"
                      ? "bg-yellow-100 text-yellow-600 border border-yellow-300"
                      : "bg-emerald-50 text-emerald-500 border border-emerald-200"
                  }`}
                >
                  {selected.membership}
                </span>
                <span className="text-xs text-slate-500">Member since {selected.memberSince}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider">NPS Score</p>
            <p
              className={`text-2xl font-bold ${
                selected.nps >= 70
                  ? "text-emerald-500"
                  : selected.nps >= 50
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {selected.nps}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 border-b border-gray-200">
          {tabs.map((tab) => {
            const key = tab.toLowerCase();
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === key
                    ? "text-emerald-500 border-emerald-500"
                    : "text-slate-500 border-transparent hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Lifetime Spend", value: fmt(selected.lifetimeSpend), icon: "account_balance_wallet" },
                  { label: "Annual Spend", value: fmt(selected.annualSpend), icon: "trending_up" },
                  { label: "Visit Frequency", value: selected.visitFreq, icon: "directions_walk" },
                  {
                    label: "Churn Risk",
                    value: riskLabel[selected.risk],
                    icon: "shield",
                    color: riskTextColor[selected.risk],
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-slate-400 text-lg">{stat.icon}</span>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    </div>
                    <p className={`text-xl font-bold ${stat.color ?? "text-slate-900"}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Visit Trend Chart */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Visit Trend (12 Months)</h3>
                <div className="flex items-end gap-2 h-32">
                  {selected.monthlyVisits.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-emerald-500/80 rounded-t"
                        style={{ height: `${maxVisit > 0 ? (v / maxVisit) * 100 : 0}%` }}
                      />
                      <span className="text-[10px] text-slate-400">{months[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {selected.recentActivity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-500/60 text-lg">{a.icon}</span>
                      <span className="text-sm text-slate-700 flex-1">{a.text}</span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Full Activity Log</h3>
              {selected.recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <span className="material-symbols-outlined text-emerald-500/60 text-lg">{a.icon}</span>
                  <span className="text-sm text-slate-700 flex-1">{a.text}</span>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{a.time}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "spending" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Lifetime Spend</p>
                  <p className="text-2xl font-bold text-slate-900">{fmt(selected.lifetimeSpend)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Annual Spend</p>
                  <p className="text-2xl font-bold text-slate-900">{fmt(selected.annualSpend)}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Spending by Category</p>
                {[
                  { cat: "Dining", pct: 42 },
                  { cat: "Golf / Tee Times", pct: 28 },
                  { cat: "Pro Shop", pct: 15 },
                  { cat: "Events", pct: 10 },
                  { cat: "Spa & Fitness", pct: 5 },
                ].map((c) => (
                  <div key={c.cat} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-slate-500 w-28">{c.cat}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 rounded-full h-2" style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">NPS Score</p>
                <p className={`text-3xl font-bold ${selected.nps >= 70 ? "text-emerald-500" : selected.nps >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                  {selected.nps}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Feedback</h3>
                <p className="text-sm text-slate-500 italic">&ldquo;Great experience at the wine tasting last week. Staff was attentive and the selections were excellent.&rdquo;</p>
                <p className="text-xs text-slate-400 mt-2">-- Survey response, Mar 15</p>
              </div>
            </div>
          )}

          {activeTab === "communications" && (
            <div className="space-y-3">
              {[
                { type: "Email", subject: "Renewal Reminder", date: "Mar 10", status: "Opened" },
                { type: "Email", subject: "February Newsletter", date: "Feb 28", status: "Opened" },
                { type: "SMS", subject: "Tee Time Confirmation", date: "Feb 14", status: "Delivered" },
                { type: "Email", subject: "Holiday Event Invitation", date: "Dec 15", status: "Clicked" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <span className="material-symbols-outlined text-emerald-500/60 text-lg">
                    {c.type === "Email" ? "mail" : "sms"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{c.subject}</p>
                    <p className="text-xs text-slate-400">{c.type}</p>
                  </div>
                  <span className="text-xs text-emerald-500">{c.status}</span>
                  <span className="text-xs text-slate-400">{c.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* -- Right Panel: AI Recommendations ------------------------ */}
      <div className="w-80 shrink-0 bg-[#F8FAFC] rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-500 text-xl">auto_awesome</span>
          <h3 className="text-sm font-semibold text-slate-800">AI Member Intelligence</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Dynamic recommendation based on selected member */}
          {selected.risk === "high" && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-red-500 text-lg">warning</span>
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">At-Risk Alert</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selected.name}&apos;s visits dropped 40% in 60 days. <strong className="text-slate-900">Recommend:</strong> personal call from GM + complimentary dinner invite.
              </p>
            </div>
          )}

          {selected.risk === "low" && selected.annualSpend > 15000 && (
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-emerald-500 text-lg">trending_up</span>
                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Growth Opportunity</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Spending trend up 15% QoQ. Consider <strong className="text-slate-900">Platinum tier upgrade</strong> invitation.
              </p>
            </div>
          )}

          {selected.risk === "medium" && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-yellow-500 text-lg">visibility</span>
                <p className="text-xs font-semibold text-yellow-500 uppercase tracking-wider">Watch List</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Visit frequency declining. <strong className="text-slate-900">Recommend:</strong> targeted event invitation based on past preferences.
              </p>
            </div>
          )}

          {/* General insights -- always shown */}
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-emerald-500 text-lg">campaign</span>
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Re-engagement</p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900">23 members</strong> haven&apos;t visited in 30+ days. Automated re-engagement campaign recommended.
            </p>
            <button className="mt-3 text-xs font-medium text-emerald-500 hover:text-emerald-600 transition-colors">
              Launch Campaign &rarr;
            </button>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-emerald-500 text-lg">auto_awesome</span>
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Predictive Insight</p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Members who attend <strong className="text-slate-900">wine events</strong> have 34% higher retention. Next wine tasting has 8 open seats.
            </p>
          </div>

          {/* Churn Risk Summary */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Churn Risk Summary</h4>
            <div className="space-y-2">
              {[
                { label: "High Risk", count: 12, color: "bg-red-500", textColor: "text-red-500" },
                { label: "Medium", count: 28, color: "bg-yellow-500", textColor: "text-yellow-500" },
                { label: "Low", count: 1208, color: "bg-emerald-500", textColor: "text-emerald-500" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${r.color}`} />
                  <span className="text-xs text-slate-500 flex-1">{r.label}</span>
                  <span className={`text-sm font-semibold ${r.textColor}`}>{r.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-1 h-2 rounded-full overflow-hidden">
              <div className="bg-red-500" style={{ width: "1%" }} />
              <div className="bg-yellow-500" style={{ width: "2.2%" }} />
              <div className="bg-emerald-500 flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
