export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">
          Operational Overview
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">
          Last updated: {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at{" "}
          {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon="group"
          label="Active Members"
          value="1,248"
          change="+12%"
          changeType="positive"
          subtitle="vs last month"
        />
        <KPICard
          icon="calendar_month"
          label="Today's Tee Times"
          value="84/96"
          change="87%"
          changeType="neutral"
          subtitle="capacity"
        />
        <KPICard
          icon="restaurant"
          label="F&B Revenue"
          value="$12,450"
          change="-2.4%"
          changeType="negative"
          subtitle="vs last week"
        />
        <KPICard
          icon="sentiment_satisfied"
          label="Member Satisfaction"
          value="92"
          change="+4%"
          changeType="positive"
          subtitle="NPS score"
        />
      </div>

      {/* AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-emerald-500 text-xl">
            auto_awesome
          </span>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            AI Insights
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            icon="warning"
            iconColor="text-amber-500"
            title="Churn Risk Alert"
            description="12 members at churn risk this month based on declining facility usage patterns."
            action="View Members"
          />
          <InsightCard
            icon="trending_up"
            iconColor="text-emerald-500"
            title="Tee Time Demand"
            description="Saturday tee times 94% booked — consider adding 6:30am early-bird slots to capture demand."
            action="View Tee Sheet"
          />
          <InsightCard
            icon="restaurant"
            iconColor="text-blue-500"
            title="F&B Opportunity"
            description="F&B spending down 8% vs last quarter — exclusive wine tasting event recommended for Platinum tiers."
            action="Create Event"
          />
        </div>
      </div>

      {/* Activity Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Feed - 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Activity Feed
            </h2>
            <div className="flex items-center gap-2 text-xs text-emerald-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-dot" />
              Live
            </div>
          </div>
          <div className="space-y-4">
            <ActivityItem
              icon="person_add"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
              title="New member registration"
              description="Patricia Harmon — Platinum tier, referred by Michael Chen"
              time="2 min ago"
            />
            <ActivityItem
              icon="golf_course"
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              title="Tee time booked"
              description="Foursome at 10:30 AM — Robert Jennings (Member #4821)"
              time="8 min ago"
            />
            <ActivityItem
              icon="restaurant"
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              title="Dining reservation"
              description="The Grille Room — Party of 6, Wine Pairing Menu — David & Margaret Liu"
              time="14 min ago"
            />
            <ActivityItem
              icon="payments"
              iconBg="bg-purple-50"
              iconColor="text-purple-500"
              title="Payment processed"
              description="Annual dues — $24,500 — Thompson Family Account"
              time="22 min ago"
            />
          </div>
        </div>

        {/* Quick Actions - 1/3 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction icon="calendar_month" label="Book Tee Time" />
              <QuickAction icon="person_add" label="New Member" />
              <QuickAction icon="event" label="Create Event" />
              <QuickAction icon="assessment" label="Run Report" />
            </div>
          </div>

          {/* Platinum Lounge */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Platinum Lounge
              </h2>
              <span className="text-xs text-emerald-500 font-medium">Live</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Currently on premises</p>
            <div className="flex -space-x-2">
              {["RJ", "MC", "PH", "DL", "SK"].map((initials, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center"
                >
                  <span className="text-[10px] font-semibold text-emerald-500">
                    {initials}
                  </span>
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-medium text-slate-500">
                  +8
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function KPICard({
  icon,
  label,
  value,
  change,
  changeType,
  subtitle,
}: {
  icon: string;
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  subtitle: string;
}) {
  const changeColor =
    changeType === "positive"
      ? "text-emerald-500"
      : changeType === "negative"
      ? "text-red-400"
      : "text-slate-400";

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm p-5 group">
      <div className="flex items-center justify-between mb-3">
        <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-500/60 transition-colors text-xl">
          {icon}
        </span>
        <span className={`text-xs font-medium ${changeColor}`}>{change}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label} &middot; {subtitle}</p>
    </div>
  );
}

function InsightCard({
  icon,
  iconColor,
  title,
  description,
  action,
}: {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  action: string;
}) {
  return (
    <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className={`material-symbols-outlined text-lg ${iconColor}`}>
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed mb-3">
        {description}
      </p>
      <button className="text-xs text-emerald-500 font-medium hover:text-emerald-600 transition-colors">
        {action} &rarr;
      </button>
    </div>
  );
}

function ActivityItem({
  icon,
  iconBg,
  iconColor,
  title,
  description,
  time,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 hover:bg-slate-50 rounded-lg p-1 -m-1 transition-colors">
      <div
        className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
      >
        <span className={`material-symbols-outlined text-lg ${iconColor}`}>
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{description}</p>
      </div>
      <span className="text-xs text-slate-400 whitespace-nowrap">{time}</span>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-50 border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all text-center">
      <span className="material-symbols-outlined text-emerald-500 text-xl">
        {icon}
      </span>
      <span className="text-xs text-slate-500 font-medium">{label}</span>
    </button>
  );
}
