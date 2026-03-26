# Stitch Design Reference — Member Intelligence Screen

Received 2026-03-27. Two screens:
1. Desktop 3-panel (sidebar + member list + detail + AI insights)
2. Mobile stacked view

Key design tokens from Stitch:
- Background: #f7f9fb (surface)
- Cards: white with border-slate-100, shadow-sm
- Primary: emerald-600 (#006c49 dark, #10b981 container)
- Sidebar: slate-50, active = white bg + emerald left border
- Member list: selected = white bg + emerald-500 left-4 border
- Avatar: emerald-100 bg with emerald-700 initials
- Risk dots: emerald-500 (low), amber-400 (medium), error/red (high)
- AI insights: emerald-50/50 bg, emerald-500 left-2 border
- NPS score: emerald circle border with number inside
- Tabs: emerald border-b-2 active
- KPI labels: text-[10px] uppercase tracking-widest slate-400
- KPI values: text-2xl font-bold tracking-tighter
- Activity items: hover:bg-slate-50, rounded-xl
- Churn bar: red 4% / amber 8% / emerald 88%
- "Generate Outreach Plan" button at bottom of AI panel
