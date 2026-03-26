export type OdooDomain = Array<string | [string, string, unknown]>;

export interface OdooSearchReadOptions {
  limit?: number;
  offset?: number;
  order?: string;
}

export interface TeeTime {
  id: number;
  date: string;
  time: string;
  holes: number;
  players: number;
  maxPlayers: number;
  status: "available" | "booked" | "blocked" | "maintenance";
  memberId?: number;
  memberName?: string;
  greenFee: number;
  cartFee: number;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  memberNumber: string;
  photo?: string;
  joinDate: string;
  status: "active" | "inactive" | "suspended";
  churnRisk: 1 | 2 | 3 | 4 | 5;
}

export interface POSItem {
  id: number;
  name: string;
  price: number;
  category: "drinks" | "food" | "proshop";
  taxRate: number;
  inStock: boolean;
}

export interface POSOrder {
  id: number;
  memberId?: number;
  items: Array<{ itemId: number; quantity: number; price: number }>;
  subtotal: number;
  tax: number;
  total: number;
  status: "open" | "closed" | "void";
  paymentMethod?: "account" | "card" | "cash";
}
