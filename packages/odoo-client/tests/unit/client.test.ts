import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OdooAuthError, OdooRPCError, OdooConnectionError } from '../../src/errors';
import type { OdooConfig } from '../../src/types';

// Mock functions
const mockLogin = vi.fn();
const mockCallKw = vi.fn();
const mockModelCreate = vi.fn();
const mockModelWrite = vi.fn();
const mockModelUnlink = vi.fn();
const mockModelSearch = vi.fn();
const mockModelRead = vi.fn();

// Mock @rlizana/odoo-rpc
vi.mock('@rlizana/odoo-rpc', () => ({
  Odoo: vi.fn().mockImplementation(() => ({
    login: mockLogin,
    call_kw: mockCallKw,
    config: { uid: 0, url: '', dbname: '', verbose: false, session: undefined, context: undefined, session_id: undefined },
    env: vi.fn().mockReturnValue({
      create: mockModelCreate,
      write: mockModelWrite,
      unlink: mockModelUnlink,
      search: mockModelSearch.mockReturnThis(),
      read: mockModelRead,
    }),
  })),
}));

// Import after mock setup
import { ClubOSClient } from '../../src/client';

const testConfig: OdooConfig = {
  url: 'http://localhost:8069',
  db: 'clubos_demo',
};

describe('ClubOSClient', () => {
  let client: ClubOSClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ClubOSClient(testConfig);
  });

  describe('constructor', () => {
    it('accepts OdooConfig and creates an instance', () => {
      expect(client).toBeInstanceOf(ClubOSClient);
    });
  });

  describe('authenticate', () => {
    it('returns a numeric uid on successful login', async () => {
      mockLogin.mockImplementation(async function(this: any) {
        // Simulate Odoo setting uid on config
        return true;
      });
      // Manually set uid on the mock's config after login
      const { Odoo } = await import('@rlizana/odoo-rpc');
      const instance = new Odoo('', '');
      instance.config.uid = 2;
      // Re-create client to use updated mock
      mockLogin.mockResolvedValue(true);

      client = new ClubOSClient(testConfig);
      // Access the internal odoo instance config to set uid
      (client as any).odoo.config.uid = 2;

      const uid = await client.authenticate('admin', 'admin');
      expect(uid).toBe(2);
      expect(mockLogin).toHaveBeenCalledWith('admin', 'admin');
    });

    it('throws OdooAuthError on login failure (returns false)', async () => {
      mockLogin.mockResolvedValue(false);

      await expect(client.authenticate('bad', 'bad')).rejects.toThrow(OdooAuthError);
    });

    it('throws OdooAuthError on login exception', async () => {
      mockLogin.mockRejectedValue(new Error('Connection refused'));

      await expect(client.authenticate('admin', 'admin')).rejects.toThrow(OdooAuthError);
    });
  });

  describe('ensureAuth', () => {
    it('throws OdooAuthError when not authenticated', async () => {
      await expect(
        client.searchRead('res.partner', [], ['name'])
      ).rejects.toThrow(OdooAuthError);
    });
  });

  describe('searchRead', () => {
    it('delegates to call_kw with search_read and correct arguments', async () => {
      mockLogin.mockResolvedValue(true);
      (client as any).odoo.config.uid = 2;
      mockCallKw.mockResolvedValue([{ id: 1, name: 'Test' }]);

      await client.authenticate('admin', 'admin');
      const result = await client.searchRead(
        'res.partner',
        [['is_company', '=', false]],
        ['name', 'email'],
        { limit: 10, order: 'name asc' }
      );

      expect(mockCallKw).toHaveBeenCalledWith(
        'res.partner',
        'search_read',
        [[['is_company', '=', false]]],
        { fields: ['name', 'email'], limit: 10, order: 'name asc' }
      );
      expect(result).toEqual([{ id: 1, name: 'Test' }]);
    });
  });

  describe('create', () => {
    it('delegates to model.create and returns numeric id', async () => {
      mockLogin.mockResolvedValue(true);
      (client as any).odoo.config.uid = 2;
      mockModelCreate.mockResolvedValue(42);

      await client.authenticate('admin', 'admin');
      const id = await client.create('res.partner', { name: 'New Partner' });

      expect(mockModelCreate).toHaveBeenCalledWith({ name: 'New Partner' });
      expect(id).toBe(42);
    });
  });

  describe('write', () => {
    it('delegates to model.write with ids and values', async () => {
      mockLogin.mockResolvedValue(true);
      (client as any).odoo.config.uid = 2;
      mockModelWrite.mockResolvedValue(true);

      await client.authenticate('admin', 'admin');
      const result = await client.write('res.partner', [42], { name: 'Updated' });

      expect(mockModelWrite).toHaveBeenCalledWith([42], { name: 'Updated' });
      expect(result).toBe(true);
    });
  });

  describe('unlink', () => {
    it('delegates to model.unlink with ids', async () => {
      mockLogin.mockResolvedValue(true);
      (client as any).odoo.config.uid = 2;
      mockModelUnlink.mockResolvedValue(true);

      await client.authenticate('admin', 'admin');
      const result = await client.unlink('res.partner', [42]);

      expect(mockModelUnlink).toHaveBeenCalledWith([42]);
      expect(result).toBe(true);
    });
  });

  describe('callMethod', () => {
    it('delegates to call_kw with model and method', async () => {
      mockLogin.mockResolvedValue(true);
      (client as any).odoo.config.uid = 2;
      mockCallKw.mockResolvedValue({ success: true });

      await client.authenticate('admin', 'admin');
      const result = await client.callMethod('res.partner', 'custom_method', [1, 2], { key: 'val' });

      expect(mockCallKw).toHaveBeenCalledWith('res.partner', 'custom_method', [1, 2], { key: 'val' });
      expect(result).toEqual({ success: true });
    });
  });

  describe('error wrapping', () => {
    it('wraps RPC errors as OdooRPCError', async () => {
      mockLogin.mockResolvedValue(true);
      (client as any).odoo.config.uid = 2;
      const rpcError = new Error('Access Denied');
      (rpcError as any).faultCode = 2;
      mockCallKw.mockRejectedValue(rpcError);

      await client.authenticate('admin', 'admin');
      await expect(client.searchRead('res.partner', [], ['name'])).rejects.toThrow(OdooRPCError);
    });

    it('wraps network errors as OdooConnectionError', async () => {
      mockLogin.mockResolvedValue(true);
      (client as any).odoo.config.uid = 2;
      const netError = new TypeError('fetch failed');
      mockCallKw.mockRejectedValue(netError);

      await client.authenticate('admin', 'admin');
      await expect(client.searchRead('res.partner', [], ['name'])).rejects.toThrow(OdooConnectionError);
    });
  });

  describe('helper methods', () => {
    it('getConfig returns a copy of the config', () => {
      const cfg = client.getConfig();
      expect(cfg).toEqual(testConfig);
      expect(cfg).not.toBe(testConfig); // copy, not reference
    });

    it('isAuthenticated returns false before auth', () => {
      expect(client.isAuthenticated()).toBe(false);
    });

    it('isAuthenticated returns true after auth', async () => {
      mockLogin.mockResolvedValue(true);
      (client as any).odoo.config.uid = 2;
      await client.authenticate('admin', 'admin');
      expect(client.isAuthenticated()).toBe(true);
    });
  });
});

describe('Error classes', () => {
  it('OdooAuthError has correct name and message', () => {
    const err = new OdooAuthError('Not authenticated');
    expect(err.name).toBe('OdooAuthError');
    expect(err.message).toBe('Not authenticated');
    expect(err).toBeInstanceOf(Error);
  });

  it('OdooRPCError has correct name, message, and faultCode', () => {
    const err = new OdooRPCError('Access Denied', 2);
    expect(err.name).toBe('OdooRPCError');
    expect(err.message).toBe('Access Denied');
    expect(err.faultCode).toBe(2);
    expect(err).toBeInstanceOf(Error);
  });

  it('OdooConnectionError has correct name and message', () => {
    const err = new OdooConnectionError('Connection refused');
    expect(err.name).toBe('OdooConnectionError');
    expect(err.message).toBe('Connection refused');
    expect(err).toBeInstanceOf(Error);
  });
});
