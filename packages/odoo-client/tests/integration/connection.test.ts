import { describe, it, expect, beforeAll } from 'vitest';
import { ClubOSClient } from '../../src/client';
import { OdooAuthError } from '../../src/errors';
import type { OdooConfig } from '../../src/types';

/**
 * Integration tests - require a running Odoo instance.
 * Set env vars: ODOO_URL, ODOO_DB, ODOO_USER, ODOO_PASSWORD
 * Default: http://localhost:8069, clubos_demo, admin, admin
 *
 * Run: npm run test:integration
 */
const config: OdooConfig = {
  url: process.env.ODOO_URL || 'http://localhost:8069',
  db: process.env.ODOO_DB || 'clubos_demo',
};

const user = process.env.ODOO_USER || 'admin';
const password = process.env.ODOO_PASSWORD || 'admin';

describe('Odoo Integration Tests', () => {
  let client: ClubOSClient;

  beforeAll(() => {
    client = new ClubOSClient(config);
  });

  describe('authenticate', () => {
    it('returns a numeric uid > 0 with valid credentials', async () => {
      const uid = await client.authenticate(user, password);
      expect(uid).toBeGreaterThan(0);
      expect(typeof uid).toBe('number');
    });

    it('throws OdooAuthError with invalid credentials', async () => {
      const badClient = new ClubOSClient(config);
      await expect(
        badClient.authenticate('nonexistent@example.com', 'wrongpassword')
      ).rejects.toThrow(OdooAuthError);
    });
  });

  describe('searchRead', () => {
    it('reads res.partner records with expected fields', async () => {
      await client.authenticate(user, password);
      const partners = await client.searchRead<{ id: number; name: string }>(
        'res.partner',
        [],
        ['name', 'email'],
        { limit: 5 }
      );

      expect(Array.isArray(partners)).toBe(true);
      expect(partners.length).toBeGreaterThan(0);
      expect(partners[0]).toHaveProperty('id');
      expect(partners[0]).toHaveProperty('name');
    });
  });

  describe('CRUD cycle on res.partner', () => {
    let createdId: number;

    it('creates a res.partner record and returns a numeric id', async () => {
      await client.authenticate(user, password);
      createdId = await client.create('res.partner', {
        name: 'ClubOS Integration Test Partner',
        email: 'test@clubos-integration.dev',
        is_company: false,
      });

      expect(typeof createdId).toBe('number');
      expect(createdId).toBeGreaterThan(0);
    });

    it('reads back the created record', async () => {
      const records = await client.searchRead<{ id: number; name: string; email: string }>(
        'res.partner',
        [['id', '=', createdId]],
        ['name', 'email']
      );

      expect(records).toHaveLength(1);
      expect(records[0].name).toBe('ClubOS Integration Test Partner');
      expect(records[0].email).toBe('test@clubos-integration.dev');
    });

    it('updates the created record', async () => {
      const result = await client.write('res.partner', [createdId], {
        name: 'ClubOS Updated Test Partner',
      });
      expect(result).toBe(true);

      const records = await client.searchRead<{ id: number; name: string }>(
        'res.partner',
        [['id', '=', createdId]],
        ['name']
      );
      expect(records[0].name).toBe('ClubOS Updated Test Partner');
    });

    it('deletes the created record', async () => {
      const result = await client.unlink('res.partner', [createdId]);
      expect(result).toBe(true);

      const records = await client.searchRead(
        'res.partner',
        [['id', '=', createdId]],
        ['name']
      );
      expect(records).toHaveLength(0);
    });
  });
});
