"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileItems = [
  { label: "Dashboard", icon: "dashboard", href: "/" },
  { label: "Tee Sheet", icon: "calendar_month", href: "/tee-sheet" },
  { label: "POS", icon: "point_of_sale", href: "/pos" },
  { label: "Members", icon: "group", href: "/members" },
  { label: "More", icon: "menu", href: "/settings" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-emerald-500/10 shadow-[0_-4px_20px_rgba(16,185,129,0.06)] z-50">
      <div className="flex items-center justify-around h-16">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                isActive ? "text-emerald-500" : "text-zinc-500"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
