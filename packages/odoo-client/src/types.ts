/** Configuration for connecting to an Odoo instance */
export interface OdooConfig {
  /** Odoo server URL (e.g., http://localhost:8069) */
  url: string;
  /** Database name (e.g., clubos_demo) */
  db: string;
}

/** Options for search_read queries */
export interface OdooSearchReadOptions {
  limit?: number;
  offset?: number;
  order?: string;
}

/** Odoo domain filter tuple: [field, operator, value] */
export type OdooDomainTuple = [string, string, unknown];

/** Odoo domain: array of filter tuples */
export type OdooDomain = OdooDomainTuple[];
