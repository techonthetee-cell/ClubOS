"use client";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 h-16 bg-[#111111] border-b border-emerald-500/10 flex items-center justify-between px-4 md:px-6">
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <span className="material-symbols-outlined text-zinc-500 text-xl">
          search
        </span>
        <input
          type="text"
          placeholder="Search members, tee times, events..."
          className="bg-[#1C1C1C] border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-emerald-500/40 w-full"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors">
          <span className="material-symbols-outlined text-zinc-400 text-xl">
            notifications
          </span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>

        {/* Live View */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 rounded-lg text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse-dot" />
          Live View
        </button>
      </div>
    </header>
  );
}
