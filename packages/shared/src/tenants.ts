import type { Tenant } from "./types/tenant";

const TENANTS: Tenant[] = [
  {
    id: "nevelmeade",
    name: "Nevel Meade Golf Club",
    slug: "nevelmeade",
    database: "clubos_nevelmeade",
    domain: "nevelmeade.clubos.app",
  },
  {
    id: "demo",
    name: "ClubOS Demo",
    slug: "demo",
    database: "clubos_demo",
    domain: "demo.clubos.app",
  },
  {
    id: "redrock",
    name: "Red Rock Country Club",
    slug: "redrock",
    database: "clubos_redrock",
    domain: "redrock.clubos.app",
  },
];

export function getTenantBySubdomain(subdomain: string): Tenant | undefined {
  return TENANTS.find((t) => t.slug === subdomain);
}

export function getTenantByDomain(domain: string): Tenant | undefined {
  return TENANTS.find((t) => t.domain === domain);
}

export function getAllTenants(): Tenant[] {
  return [...TENANTS];
}
