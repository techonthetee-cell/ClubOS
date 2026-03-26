#!/usr/bin/env node
/**
 * Seed mock data into Supabase for ClubOS demo
 * Run: node scripts/seed-supabase.mjs
 */

const SUPABASE_URL = "https://xshxhmubvnnrmeusgyfd.supabase.co";
const ANON_KEY = "sb_publishable_rMBGuXND9Os8G_p_leVJrg_-Hl2epng";

const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function post(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`ERROR inserting into ${table}:`, res.status, text);
    return null;
  }
  const json = await res.json();
  console.log(`Inserted ${Array.isArray(json) ? json.length : 1} rows into ${table}`);
  return json;
}

async function main() {
  // ---- 1. Members ----
  const members = await post("members", [
    { member_number: "WS001", first_name: "William", last_name: "Sterling", membership_type: "Executive", status: "active", join_date: "2016-01-15", nps_score: 92, churn_risk: 1, lifetime_spend: 142800, annual_spend: 18400, visit_frequency: 3.2 },
    { member_number: "SJ002", first_name: "Sarah", last_name: "Jenkins", membership_type: "Platinum", status: "active", join_date: "2018-03-22", nps_score: 88, churn_risk: 1, lifetime_spend: 98200, annual_spend: 14600, visit_frequency: 2.8 },
    { member_number: "ML003", first_name: "Michael", last_name: "Lane", membership_type: "Gold", status: "active", join_date: "2019-06-10", nps_score: 34, churn_risk: 5, lifetime_spend: 52400, annual_spend: 6200, visit_frequency: 0.4 },
    { member_number: "PH004", first_name: "Patricia", last_name: "Howard", membership_type: "Social", status: "active", join_date: "2020-02-28", nps_score: 62, churn_risk: 3, lifetime_spend: 31600, annual_spend: 8400, visit_frequency: 1.5 },
    { member_number: "RW005", first_name: "Robert", last_name: "Whitlock", membership_type: "Gold", status: "active", join_date: "2017-09-05", nps_score: 85, churn_risk: 1, lifetime_spend: 118600, annual_spend: 16200, visit_frequency: 2.5 },
    { member_number: "JC006", first_name: "James", last_name: "Chen", membership_type: "Executive", status: "active", join_date: "2015-11-18", nps_score: 95, churn_risk: 1, lifetime_spend: 210400, annual_spend: 24800, visit_frequency: 4.1 },
    { member_number: "LM007", first_name: "Linda", last_name: "Morrison", membership_type: "Platinum", status: "active", join_date: "2019-04-12", nps_score: 58, churn_risk: 3, lifetime_spend: 68400, annual_spend: 10200, visit_frequency: 1.8 },
    { member_number: "DT008", first_name: "David", last_name: "Thompson", membership_type: "Gold", status: "active", join_date: "2020-08-30", nps_score: 28, churn_risk: 5, lifetime_spend: 38200, annual_spend: 4800, visit_frequency: 0.2 },
  ]);

  if (!members) { console.error("Members insert failed, aborting."); process.exit(1); }

  // Build a member lookup by member_number
  const memberMap = {};
  for (const m of members) {
    memberMap[m.member_number] = m.id;
  }

  // ---- 2. Tee Times (12 slots for today) ----
  const today = new Date().toISOString().split("T")[0];
  const teeTimesData = [
    { tee_date: today, tee_time: "06:00", hole_start: 1, status: "booked", max_players: 4, green_fee: 95, cart_fee: 35 },
    { tee_date: today, tee_time: "06:08", hole_start: 1, status: "booked", max_players: 4, green_fee: 95, cart_fee: 35 },
    { tee_date: today, tee_time: "06:16", hole_start: 1, status: "available", max_players: 4, green_fee: 0, cart_fee: 0 },
    { tee_date: today, tee_time: "06:24", hole_start: 1, status: "booked", max_players: 4, green_fee: 95, cart_fee: 35 },
    { tee_date: today, tee_time: "06:32", hole_start: 1, status: "available", max_players: 4, green_fee: 0, cart_fee: 0 },
    { tee_date: today, tee_time: "06:40", hole_start: 1, status: "booked", max_players: 4, green_fee: 95, cart_fee: 35 },
    { tee_date: today, tee_time: "06:48", hole_start: 1, status: "blocked", max_players: 4, green_fee: 0, cart_fee: 0, notes: "Maintenance" },
    { tee_date: today, tee_time: "06:56", hole_start: 1, status: "booked", max_players: 4, green_fee: 95, cart_fee: 35 },
    { tee_date: today, tee_time: "07:04", hole_start: 1, status: "booked", max_players: 4, green_fee: 95, cart_fee: 35 },
    { tee_date: today, tee_time: "07:12", hole_start: 1, status: "available", max_players: 4, green_fee: 0, cart_fee: 0 },
    { tee_date: today, tee_time: "07:20", hole_start: 1, status: "booked", max_players: 4, green_fee: 95, cart_fee: 35 },
    { tee_date: today, tee_time: "07:28", hole_start: 1, status: "maintenance", max_players: 4, green_fee: 0, cart_fee: 0, notes: "Course maintenance" },
  ];

  const teeTimes = await post("tee_times", teeTimesData);
  if (!teeTimes) { console.error("Tee times insert failed, aborting."); process.exit(1); }

  // ---- 3. Tee Time Bookings (link members to booked tee times) ----
  // Only booked tee times get bookings
  const bookedTimes = teeTimes.filter((t) => t.status === "booked");

  const bookingsData = [
    // 06:00 - William Sterling + James Chen (2-some)
    { tee_time_id: bookedTimes[0].id, member_id: memberMap["WS001"], player_number: 1, cart_type: "riding", green_fee: 95, cart_fee: 35 },
    { tee_time_id: bookedTimes[0].id, member_id: memberMap["JC006"], player_number: 2, cart_type: "riding", green_fee: 95, cart_fee: 35 },
    // 06:08 - Sarah Jenkins solo
    { tee_time_id: bookedTimes[1].id, member_id: memberMap["SJ002"], player_number: 1, cart_type: "riding", green_fee: 95, cart_fee: 35 },
    // 06:24 - Robert Whitlock + guest
    { tee_time_id: bookedTimes[2].id, member_id: memberMap["RW005"], player_number: 1, cart_type: "riding", green_fee: 95, cart_fee: 35 },
    { tee_time_id: bookedTimes[2].id, guest_name: "Tom Guest", is_guest: true, player_number: 2, cart_type: "riding", green_fee: 95, cart_fee: 35, guest_fee: 50 },
    // 06:40 - Michael Lane solo (at-risk member)
    { tee_time_id: bookedTimes[3].id, member_id: memberMap["ML003"], player_number: 1, cart_type: "walking", green_fee: 95, cart_fee: 0 },
    // 06:56 - Patricia Howard
    { tee_time_id: bookedTimes[4].id, member_id: memberMap["PH004"], player_number: 1, cart_type: "riding", green_fee: 95, cart_fee: 35 },
    // 07:04 - Linda Morrison + David Thompson
    { tee_time_id: bookedTimes[5].id, member_id: memberMap["LM007"], player_number: 1, cart_type: "riding", green_fee: 95, cart_fee: 35 },
    { tee_time_id: bookedTimes[5].id, member_id: memberMap["DT008"], player_number: 2, cart_type: "riding", green_fee: 95, cart_fee: 35 },
    // 07:20 - James Chen again (second round)
    { tee_time_id: bookedTimes[6].id, member_id: memberMap["JC006"], player_number: 1, cart_type: "riding", green_fee: 95, cart_fee: 35 },
  ];

  await post("tee_time_bookings", bookingsData);

  // ---- 4. POS Menu Items ----
  await post("pos_items", [
    { name: "Old Fashioned", price: 16, category: "Drinks", tax_rate: 0.06, sort_order: 1 },
    { name: "Draft IPA", price: 9, category: "Drinks", tax_rate: 0.06, sort_order: 2 },
    { name: "Wine Glass", price: 14, category: "Drinks", tax_rate: 0.06, sort_order: 3 },
    { name: "Water", price: 3, category: "Drinks", tax_rate: 0, sort_order: 4 },
    { name: "Club Burger", price: 22, category: "Food", tax_rate: 0.06, sort_order: 5 },
    { name: "Caesar Salad", price: 18, category: "Food", tax_rate: 0.06, sort_order: 6 },
    { name: "Wagyu Steak", price: 65, category: "Food", tax_rate: 0.06, sort_order: 7 },
    { name: "Pro V1 Sleeve", price: 16, category: "Pro Shop", tax_rate: 0.06, sort_order: 8 },
    { name: "Polo Shirt", price: 85, category: "Pro Shop", tax_rate: 0.06, sort_order: 9 },
    { name: "Golf Glove", price: 24, category: "Pro Shop", tax_rate: 0.06, sort_order: 10 },
  ]);

  console.log("\nSeed complete!");
}

main().catch(console.error);
