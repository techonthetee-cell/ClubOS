"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/" },
  { label: "Tee Sheet", icon: "calendar_month", href: "/tee-sheet" },
  { label: "POS", icon: "point_of_sale", href: "/pos" },
  { label: "Members", icon: "group", href: "/members" },
  { label: "Billing", icon: "receipt_long", href: "/billing" },
  { label: "Events", icon: "event", href: "/events" },
  { label: "Dining", icon: "restaurant", href: "/dining" },
  { label: "Analytics", icon: "analytics", href: "/analytics" },
  { label: "AI Insights", icon: "auto_awesome", href: "/ai-insights" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[240px] bg-[#0A0A0A] border-r border-emerald-500/10 flex-col z-50">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-500 text-3xl">
            sports_golf
          </span>
          <div>
            <h1 className="text-xl font-bold text-emerald-500 tracking-tight">
              ClubOS
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
              Elite Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-emerald-500 bg-emerald-500/10 border-l-4 border-emerald-500 -ml-px"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl ${
                  isActive ? "text-emerald-500" : ""
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-emerald-500">GM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">
              James Mitchell
            </p>
            <p className="text-xs text-zinc-500 truncate">General Manager</p>
          </div>
          <span className="material-symbols-outlined text-zinc-600 text-lg cursor-pointer hover:text-zinc-400">
            more_vert
          </span>
        </div>
      </div>
    </aside>
  );
}
