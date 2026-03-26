/**
 * Quick standalone script to test Odoo connection.
 * Usage: npx tsx scripts/test-odoo-connection.ts
 *
 * Requires Odoo running at ODOO_URL (default: http://localhost:8069)
 * with database ODOO_DB (default: clubos_demo).
 */

import { ClubOSClient, createServiceClient } from '../packages/odoo-client/src/index';

const config = {
  url: process.env.ODOO_URL || 'http://localhost:8069',
  db: process.env.ODOO_DB || 'clubos_demo',
};

const user = process.env.ODOO_USER || 'admin';
const password = process.env.ODOO_PASSWORD || 'admin';

async function main() {
  console.log(`\nConnecting to Odoo at ${config.url} (db: ${config.db})...\n`);

  try {
    // Test 1: Authenticate
    const client = await createServiceClient(config, user, password);
    console.log('[PASS] Authenticated successfully');

    // Test 2: Read partners
    const partners = await client.searchRead<{ id: number; name: string; email: string | false }>(
      'res.partner',
      [],
      ['name', 'email'],
      { limit: 5 }
    );
    console.log(`[PASS] Found ${partners.length} partners:`);
    for (const p of partners) {
      console.log(`  - ${p.name} (${p.email || 'no email'})`);
    }

    // Test 3: Create, read, delete
    const testId = await client.create('res.partner', {
      name: 'ClubOS Connection Test',
      email: 'test@clubos.dev',
    });
    console.log(`[PASS] Created test partner id=${testId}`);

    const [record] = await client.searchRead<{ id: number; name: string }>(
      'res.partner',
      [['id', '=', testId]],
      ['name']
    );
    console.log(`[PASS] Read back: ${record.name}`);

    await client.unlink('res.partner', [testId]);
    console.log(`[PASS] Deleted test partner`);

    console.log('\n--- All connection tests passed! Odoo integration is GO. ---\n');
  } catch (err) {
    console.error(`\n[FAIL] ${err}\n`);
    process.exit(1);
  }
}

main();
