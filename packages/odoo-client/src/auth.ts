import { ClubOSClient } from './client.js';
import type { OdooConfig } from './types.js';

/**
 * Create an authenticated ClubOS client (service account pattern).
 *
 * Re-authenticates on every call -- safe for serverless environments
 * where sessions don't persist between function invocations.
 *
 * @param config - Odoo connection config (url + db)
 * @param login - Odoo user login (email)
 * @param password - Odoo user password or API key
 * @returns Authenticated ClubOSClient ready for CRUD operations
 */
export async function createServiceClient(
  config: OdooConfig,
  login: string,
  password: string
): Promise<ClubOSClient> {
  const client = new ClubOSClient(config);
  await client.authenticate(login, password);
  return client;
}
