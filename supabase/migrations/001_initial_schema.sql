-- ClubOS Initial Schema
-- Tee Times, Members, POS

-- ============================================
-- MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_number text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  photo_url text,
  membership_type text NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'active',
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  nps_score integer,
  churn_risk integer DEFAULT 1 CHECK (churn_risk BETWEEN 1 AND 5),
  lifetime_spend numeric(12,2) DEFAULT 0,
  annual_spend numeric(12,2) DEFAULT 0,
  visit_frequency numeric(4,2) DEFAULT 0,
  family_group_id uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_membership_type ON members(membership_type);
CREATE INDEX idx_members_churn_risk ON members(churn_risk);

-- ============================================
-- TEE TIMES
-- ============================================
CREATE TABLE IF NOT EXISTS tee_times (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tee_date date NOT NULL,
  tee_time time NOT NULL,
  hole_start integer NOT NULL DEFAULT 1 CHECK (hole_start IN (1, 10)),
  status text NOT NULL DEFAULT 'available',
  max_players integer NOT NULL DEFAULT 4,
  green_fee numeric(8,2) DEFAULT 0,
  cart_fee numeric(8,2) DEFAULT 0,
  dynamic_price_multiplier numeric(4,2) DEFAULT 1.0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tee_date, tee_time, hole_start)
);

CREATE INDEX idx_tee_times_date ON tee_times(tee_date);
CREATE INDEX idx_tee_times_status ON tee_times(status);

-- ============================================
-- TEE TIME BOOKINGS (players in a tee time)
-- ============================================
CREATE TABLE IF NOT EXISTS tee_time_bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tee_time_id uuid NOT NULL REFERENCES tee_times(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id),
  guest_name text,
  is_guest boolean DEFAULT false,
  player_number integer NOT NULL CHECK (player_number BETWEEN 1 AND 4),
  cart_type text DEFAULT 'riding',
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  green_fee numeric(8,2) DEFAULT 0,
  cart_fee numeric(8,2) DEFAULT 0,
  guest_fee numeric(8,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tee_time_id, player_number)
);

CREATE INDEX idx_bookings_tee_time ON tee_time_bookings(tee_time_id);
CREATE INDEX idx_bookings_member ON tee_time_bookings(member_id);

-- ============================================
-- MEMBER ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS member_activity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  description text NOT NULL,
  amount numeric(10,2),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_activity_member ON member_activity(member_id);
CREATE INDEX idx_activity_type ON member_activity(activity_type);
CREATE INDEX idx_activity_date ON member_activity(created_at);

-- ============================================
-- POS MENU ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS pos_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price numeric(8,2) NOT NULL,
  category text NOT NULL,
  tax_rate numeric(4,4) DEFAULT 0.06,
  in_stock boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- POS ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS pos_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid REFERENCES members(id),
  status text NOT NULL DEFAULT 'open',
  subtotal numeric(10,2) DEFAULT 0,
  tax numeric(10,2) DEFAULT 0,
  total numeric(10,2) DEFAULT 0,
  payment_method text,
  closed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pos_order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES pos_orders(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES pos_items(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(8,2) NOT NULL,
  total numeric(8,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- AI INSIGHTS (cached AI recommendations)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid REFERENCES members(id),
  insight_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  priority text DEFAULT 'medium',
  action_label text,
  dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX idx_insights_member ON ai_insights(member_id);

-- ============================================
-- RLS POLICIES (open for now, tighten later)
-- ============================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tee_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE tee_time_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Open policies for MVP (all authenticated + anon access)
CREATE POLICY "Allow all" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON tee_times FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON tee_time_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON member_activity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pos_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pos_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pos_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ai_insights FOR ALL USING (true) WITH CHECK (true);
