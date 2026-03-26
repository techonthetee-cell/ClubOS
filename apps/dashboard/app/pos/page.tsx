"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types & mock data                                                  */
/* ------------------------------------------------------------------ */

type Category = "All" | "Drinks" | "Food" | "Pro Shop";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: Category;
  icon: string; // Material Symbols name
}

const MENU_ITEMS: MenuItem[] = [
  { id: 1, name: "Old Fashioned", price: 16, category: "Drinks", icon: "local_bar" },
  { id: 2, name: "Draft IPA", price: 9, category: "Drinks", icon: "sports_bar" },
  { id: 3, name: "Wine (Glass)", price: 14, category: "Drinks", icon: "wine_bar" },
  { id: 4, name: "Club Burger", price: 22, category: "Food", icon: "lunch_dining" },
  { id: 5, name: "Caesar Salad", price: 18, category: "Food", icon: "salad" },
  { id: 6, name: "Wagyu Steak", price: 65, category: "Food", icon: "restaurant" },
  { id: 7, name: "Pro V1 Sleeve", price: 16, category: "Pro Shop", icon: "sports_golf" },
  { id: 8, name: "Polo Shirt", price: 85, category: "Pro Shop", icon: "checkroom" },
];

interface OrderLine {
  item: MenuItem;
  qty: number;
}

const CATEGORIES: Category[] = ["All", "Drinks", "Food", "Pro Shop"];
const TAX_RATE = 0.08;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function POSPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [order, setOrder] = useState<OrderLine[]>([
    { item: MENU_ITEMS[0], qty: 2 }, // 2x Old Fashioned
    { item: MENU_ITEMS[3], qty: 1 }, // 1x Club Burger
  ]);

  const filtered =
    activeCategory === "All"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((m) => m.category === activeCategory);

  /* Order helpers */
  const addItem = (item: MenuItem) => {
    setOrder((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeItem = (id: number) => {
    setOrder((prev) => prev.filter((l) => l.item.id !== id));
  };

  const subtotal = order.reduce((sum, l) => sum + l.item.price * l.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + tax;

  return (
    <div className="flex h-screen bg-white text-slate-800 font-sans overflow-hidden">
      {/* ================================================================ */}
      {/*  LEFT — Menu Grid                                                */}
      {/* ================================================================ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Category tabs */}
        <div className="flex items-center gap-1 px-6 py-4 border-b border-gray-200 shrink-0">
          <h1 className="text-xl font-semibold text-emerald-500 mr-6">POS</h1>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-slate-500 hover:text-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="bg-white rounded-xl p-4 flex flex-col items-start gap-3 border border-gray-200 hover:border-emerald-200 transition-colors text-left group shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500 text-[20px]">
                    {item.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-emerald-500 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                </div>
                <p className="text-sm font-semibold text-emerald-500">${item.price}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  RIGHT — Current Order                                           */}
      {/* ================================================================ */}
      <div className="w-96 shrink-0 border-l border-gray-200 bg-[#F8FAFC] flex flex-col">
        {/* Member info */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-200 space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-[18px]">
              person
            </span>
            <span className="text-sm font-semibold text-slate-800">William Sterling</span>
            <span className="ml-auto text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#D4A843]/20 text-[#D4A843]">
              VIP
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Account #1247</p>

          {/* Preferences / Allergies */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200">
              Preference: Old Fashioned
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
              Allergy: Shellfish
            </span>
          </div>

          {/* AI suggestion */}
          <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
            <span className="material-symbols-outlined text-emerald-500 text-[16px] mt-0.5">
              auto_awesome
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              This member usually orders Old Fashioned
            </p>
          </div>
        </div>

        {/* Order lines */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Current Order
          </h3>
          {order.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No items yet</p>
          ) : (
            <div className="space-y-3">
              {order.map((line) => (
                <div
                  key={line.item.id}
                  className="flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 border border-gray-200 shadow-sm"
                >
                  <span className="text-xs font-bold text-emerald-500 w-5 text-center">
                    {line.qty}x
                  </span>
                  <span className="text-xs font-medium text-slate-700 flex-1 truncate">{line.item.name}</span>
                  <span className="text-xs text-slate-500">
                    ${line.item.price * line.qty}
                  </span>
                  <button
                    onClick={() => removeItem(line.item.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals + Actions */}
        <div className="border-t border-gray-200 px-5 py-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-slate-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="flex flex-col gap-2 pt-3">
            <button className="w-full py-2.5 rounded-lg bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
              Charge to Account
            </button>
            <button className="w-full py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Credit Card
            </button>
            <button className="w-full py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-gray-300 transition-colors">
              Split Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
