export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff" | "member";
  tenantId: string;
}

export interface Session {
  user: User;
  accessToken: string;
  tenantDb: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
