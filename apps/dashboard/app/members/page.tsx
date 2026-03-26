"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DbMember {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  membership_type: string;
  status: string;
  join_date: string;
  nps_score: number | null;
  churn_risk: number | null;
  lifetime_spend: number;
  annual_spend: number;
  visit_frequency: number;
  notes: string | null;
}

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  amount: number | null;
  created_at: string;
}

type RiskLevel = "low" | "medium" | "high";
type FilterType = "all" | "vip" | "at-risk" | "new";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(first: string, last: string): string {
  return `${first[0] || ""}${last[0] || ""}`.toUpperCase();
}

function riskFromScore(score: number | null): RiskLevel {
  if (!score || score <= 2) return "low";
  if (score <= 3) return "medium";
  return "high";
}

function fmt(n: number) {
  return "$" + n.toLocaleString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function activityIcon(type: string): string {
  const map: Record<string, string> = {
    check_in: "login",
    tee_time: "golf_course",
    dining: "restaurant",
    pro_shop: "shopping_bag",
    event: "event",
    spa: "spa",
    fitness: "fitness_center",
    payment: "payments",
    communication: "mail",
  };
  return map[type] || "circle";
}

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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MembersPage() {
  const [members, setMembers] = useState<DbMember[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch members
  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("status", "active")
        .order("last_name", { ascending: true });

      if (error) {
        console.error("Error fetching members:", error);
      } else {
        const m = (data as DbMember[]) || [];
        setMembers(m);
        if (m.length > 0 && !selectedId) {
          setSelectedId(m[0].id);
        }
      }
      setLoading(false);
    }
    fetchMembers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch activities for selected member
  useEffect(() => {
    if (!selectedId) return;
    async function fetchActivities() {
      const { data, error } = await supabase
        .from("member_activity")
        .select("*")
        .eq("member_id", selectedId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching activities:", error);
      } else {
        setActivities((data as Activity[]) || []);
      }
    }
    fetchActivities();
  }, [selectedId]);

  // Filter members
  const filtered = useMemo(() => {
    return members.filter((m) => {
      const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
      if (search && !fullName.includes(search.toLowerCase())) return false;
      if (filter === "vip")
        return m.membership_type === "executive" || m.membership_type === "platinum";
      if (filter === "at-risk") return (m.churn_risk || 1) >= 4;
      if (filter === "new") {
        const joinYear = new Date(m.join_date).getFullYear();
        return joinYear >= 2024;
      }
      return true;
    });
  }, [members, search, filter]);

  const selected = members.find((m) => m.id === selectedId) ?? members[0];
  const risk: RiskLevel = selected ? riskFromScore(selected.churn_risk) : "low";

  // Generate synthetic monthly visits from visit_frequency
  const monthlyVisits = useMemo(() => {
    if (!selected) return Array(12).fill(0);
    const base = selected.visit_frequency * 4.3; // weekly to monthly
    return Array.from({ length: 12 }, (_, i) => {
      // Add slight variance per month
      const variance = Math.sin(i * 0.8) * 2 + (Math.random() - 0.5) * 2;
      return Math.max(0, Math.round(base + variance));
    });
  }, [selected]);

  const maxVisit = Math.max(...monthlyVisits, 1);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "vip", label: "VIP" },
    { key: "at-risk", label: "At Risk" },
    { key: "new", label: "New" },
  ];

  const tabs = ["Overview", "Activity", "Spending", "Feedback"];

  // Churn risk summary counts
  const riskCounts = useMemo(() => {
    const high = members.filter((m) => (m.churn_risk || 1) >= 4).length;
    const medium = members.filter((m) => (m.churn_risk || 1) === 3).length;
    const low = members.filter((m) => (m.churn_risk || 1) <= 2).length;
    return { high, medium, low };
  }, [members]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)]">
        <div className="text-sm text-slate-400">Loading members...</div>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)]">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">group</span>
          <p className="text-sm text-slate-400">No members found</p>
        </div>
      </div>
    );
  }

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

        {/* Member count */}
        <div className="px-3 py-2 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          {filtered.length} member{filtered.length !== 1 ? "s" : ""}
        </div>

        {/* Member Cards */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map((m) => {
            const mRisk = riskFromScore(m.churn_risk);
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedId(m.id);
                  setActiveTab("overview");
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  selectedId === m.id
                    ? "bg-white border-l-4 border-emerald-500 shadow-sm"
                    : "hover:bg-slate-50 border-l-4 border-transparent"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-emerald-500">
                    {getInitials(m.first_name, m.last_name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {m.first_name} {m.last_name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{m.membership_type}</p>
                </div>
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${riskColor[mRisk]}`}
                  title={riskLabel[mRisk]}
                />
              </button>
            );
          })}
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
              <span className="text-lg font-bold text-emerald-500">
                {getInitials(selected.first_name, selected.last_name)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {selected.first_name} {selected.last_name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    selected.membership_type === "executive"
                      ? "bg-[#D4A843]/20 text-[#D4A843] border border-[#D4A843]/30"
                      : selected.membership_type === "platinum"
                      ? "bg-slate-200 text-slate-600 border border-slate-300"
                      : selected.membership_type === "gold"
                      ? "bg-yellow-100 text-yellow-600 border border-yellow-300"
                      : "bg-emerald-50 text-emerald-500 border border-emerald-200"
                  }`}
                >
                  {selected.membership_type}
                </span>
                <span className="text-xs text-slate-500">
                  Member since {new Date(selected.join_date).getFullYear()}
                </span>
                <span className="text-xs text-slate-400">#{selected.member_number}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider">NPS Score</p>
            <p
              className={`text-2xl font-bold ${
                (selected.nps_score || 0) >= 70
                  ? "text-emerald-500"
                  : (selected.nps_score || 0) >= 50
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {selected.nps_score ?? "--"}
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
                  {
                    label: "Lifetime Spend",
                    value: fmt(Number(selected.lifetime_spend)),
                    icon: "account_balance_wallet",
                  },
                  {
                    label: "Annual Spend",
                    value: fmt(Number(selected.annual_spend)),
                    icon: "trending_up",
                  },
                  {
                    label: "Visits/Week",
                    value: `${Number(selected.visit_frequency).toFixed(1)}`,
                    icon: "directions_walk",
                  },
                  {
                    label: "Risk Level",
                    value: riskLabel[risk],
                    icon: "shield",
                    color: riskTextColor[risk],
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
                  {monthlyVisits.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-emerald-500/80 rounded-t transition-all"
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
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((a) => (
                      <div key={a.id} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-500/60 text-lg">
                          {activityIcon(a.activity_type)}
                        </span>
                        <span className="text-sm text-slate-700 flex-1">{a.description}</span>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {timeAgo(a.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No recent activity</p>
                )}
              </div>

              {/* Contact Info */}
              {(selected.email || selected.phone) && (
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact</h3>
                  <div className="space-y-2">
                    {selected.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
                        {selected.email}
                      </div>
                    )}
                    {selected.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="material-symbols-outlined text-slate-400 text-lg">phone</span>
                        {selected.phone}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Full Activity Log</h3>
              {activities.length > 0 ? (
                activities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-emerald-500/60 text-lg">
                      {activityIcon(a.activity_type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-700">{a.description}</span>
                      {a.amount && (
                        <span className="ml-2 text-xs font-medium text-emerald-600">{fmt(Number(a.amount))}</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(a.created_at)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No activity recorded</p>
              )}
            </div>
          )}

          {activeTab === "spending" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Lifetime Spend</p>
                  <p className="text-2xl font-bold text-slate-900">{fmt(Number(selected.lifetime_spend))}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Annual Spend</p>
                  <p className="text-2xl font-bold text-slate-900">{fmt(Number(selected.annual_spend))}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Estimated by Category</p>
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
                <p
                  className={`text-3xl font-bold ${
                    (selected.nps_score || 0) >= 70
                      ? "text-emerald-500"
                      : (selected.nps_score || 0) >= 50
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {selected.nps_score ?? "--"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {(selected.nps_score || 0) >= 70
                    ? "Promoter"
                    : (selected.nps_score || 0) >= 50
                    ? "Passive"
                    : "Detractor"}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Member Notes</h3>
                <p className="text-sm text-slate-500">
                  {selected.notes || "No notes recorded for this member."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* -- Right Panel: AI Intelligence ----------------------------- */}
      <div className="w-80 shrink-0 bg-[#F8FAFC] rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-xl">auto_awesome</span>
            <h3 className="text-sm font-semibold text-slate-800">AI Intelligence</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
            <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Live</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Dynamic recommendation based on selected member */}
          {risk === "high" && (
            <div className="bg-white rounded-lg p-4 border-l-4 border-l-red-500 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-red-500 text-lg">warning</span>
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Churn Warning</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selected.first_name}&apos;s visit frequency is{" "}
                <strong className="text-slate-900">{Number(selected.visit_frequency).toFixed(1)}/week</strong>
                {Number(selected.visit_frequency) < 1 && " -- well below healthy range"}.
                Recommend personal outreach from GM + complimentary round.
              </p>
            </div>
          )}

          {risk === "low" && Number(selected.annual_spend) > 15000 && (
            <div className="bg-white rounded-lg p-4 border-l-4 border-l-emerald-500 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-emerald-500 text-lg">diamond</span>
                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Value Profile</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                High-value member spending{" "}
                <strong className="text-slate-900">{fmt(Number(selected.annual_spend))}/yr</strong>.
                Consider tier upgrade invitation or VIP perks package.
              </p>
            </div>
          )}

          {risk === "medium" && (
            <div className="bg-white rounded-lg p-4 border-l-4 border-l-yellow-500 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-yellow-500 text-lg">visibility</span>
                <p className="text-xs font-semibold text-yellow-500 uppercase tracking-wider">Engagement Gap</p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Visit frequency declining. Recommend targeted event invitation based on past activity patterns.
              </p>
            </div>
          )}

          {/* Always-shown insights */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-l-emerald-500 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-emerald-500 text-lg">campaign</span>
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Re-engagement</p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900">{riskCounts.high + riskCounts.medium} members</strong> need
              attention. Automated re-engagement campaign recommended.
            </p>
            <button className="mt-3 text-xs font-medium text-emerald-500 hover:text-emerald-600 transition-colors">
              Launch Campaign &rarr;
            </button>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-l-emerald-500 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-emerald-500 text-lg">auto_awesome</span>
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Predictive Insight</p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Members who attend <strong className="text-slate-900">wine events</strong> have 34% higher retention.
              Next wine tasting has 8 open seats.
            </p>
          </div>

          {/* Churn Risk Summary */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Global Churn Overview
            </h4>
            <div className="space-y-2">
              {[
                { label: "High Risk", count: riskCounts.high, color: "bg-red-500", textColor: "text-red-500" },
                { label: "Medium", count: riskCounts.medium, color: "bg-yellow-500", textColor: "text-yellow-500" },
                { label: "Low", count: riskCounts.low, color: "bg-emerald-500", textColor: "text-emerald-500" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${r.color}`} />
                  <span className="text-xs text-slate-500 flex-1">{r.label}</span>
                  <span className={`text-sm font-semibold ${r.textColor}`}>{r.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-1 h-2 rounded-full overflow-hidden">
              {(() => {
                const total = members.length || 1;
                return (
                  <>
                    <div className="bg-red-500" style={{ width: `${(riskCounts.high / total) * 100}%` }} />
                    <div className="bg-yellow-500" style={{ width: `${(riskCounts.medium / total) * 100}%` }} />
                    <div className="bg-emerald-500 flex-1" />
                  </>
                );
              })()}
            </div>
          </div>

          {/* Generate Outreach Plan */}
          <button className="w-full py-3 rounded-lg bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            Generate Outreach Plan
          </button>
        </div>
      </div>
    </div>
  );
}
