import { Odoo } from '@rlizana/odoo-rpc';
import { OdooAuthError, OdooRPCError, OdooConnectionError } from './errors.js';
import type { OdooConfig, OdooDomain, OdooSearchReadOptions } from './types.js';

/**
 * Typed Odoo JSON-RPC client for ClubOS.
 *
 * Wraps @rlizana/odoo-rpc with typed methods, proper error handling,
 * and an authentication guard. All Odoo communication goes through this client.
 */
export class ClubOSClient {
  private odoo: Odoo;
  private _authenticated = false;
  private _uid = 0;
  private config: OdooConfig;

  constructor(config: OdooConfig) {
    this.config = config;
    this.odoo = new Odoo(config.url, config.db);
  }

  /** Authenticate with Odoo. Returns the user id (uid). */
  async authenticate(login: string, password: string): Promise<number> {
    try {
      const success = await this.odoo.login(login, password);
      if (!success) {
        throw new OdooAuthError('Invalid credentials');
      }
      this._authenticated = true;
      this._uid = this.odoo.config.uid;
      return this._uid;
    } catch (err) {
      if (err instanceof OdooAuthError) throw err;
      throw new OdooAuthError(
        err instanceof Error ? err.message : 'Authentication failed'
      );
    }
  }

  /** Search and read records from an Odoo model. */
  async searchRead<T extends Record<string, unknown> = Record<string, unknown>>(
    model: string,
    domain: OdooDomain,
    fields: string[],
    options?: OdooSearchReadOptions
  ): Promise<T[]> {
    this.ensureAuth();
    try {
      // Use call_kw for search_read which supports limit/offset/order
      const kwargs: Record<string, unknown> = {
        fields,
        ...(options?.limit !== undefined && { limit: options.limit }),
        ...(options?.offset !== undefined && { offset: options.offset }),
        ...(options?.order !== undefined && { order: options.order }),
      };
      const result = await this.odoo.call_kw(
        model,
        'search_read',
        [domain],
        kwargs
      );
      return (result ?? []) as T[];
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  /** Create a new record. Returns the new record's id. */
  async create(model: string, values: Record<string, unknown>): Promise<number> {
    this.ensureAuth();
    try {
      const env = this.odoo.env(model);
      const id = await env.create(values as Record<string, any>);
      return id as number;
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  /** Update existing records. Returns true on success. */
  async write(model: string, ids: number[], values: Record<string, unknown>): Promise<boolean> {
    this.ensureAuth();
    try {
      const env = this.odoo.env(model);
      await env.write(ids, values as Record<string, any>);
      return true;
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  /** Delete records by ids. Returns true on success. */
  async unlink(model: string, ids: number[]): Promise<boolean> {
    this.ensureAuth();
    try {
      const env = this.odoo.env(model);
      await env.unlink(ids);
      return true;
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  /** Call a custom method on an Odoo model. */
  async callMethod(
    model: string,
    method: string,
    args: unknown[],
    kwargs?: Record<string, unknown>
  ): Promise<unknown> {
    this.ensureAuth();
    try {
      return await this.odoo.call_kw(
        model,
        method,
        args as any[],
        kwargs as Record<string, any>
      );
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  /** Get the underlying configuration */
  getConfig(): OdooConfig {
    return { ...this.config };
  }

  /** Check if the client is authenticated */
  isAuthenticated(): boolean {
    return this._authenticated;
  }

  /** Get the authenticated user's uid */
  get uid(): number {
    return this._uid;
  }

  /** Throw OdooAuthError if not authenticated */
  private ensureAuth(): void {
    if (!this._authenticated) {
      throw new OdooAuthError('Not authenticated. Call authenticate() first.');
    }
  }

  /** Convert unknown errors into typed ClubOS errors */
  private wrapError(err: unknown): OdooAuthError | OdooRPCError | OdooConnectionError {
    if (err instanceof OdooAuthError || err instanceof OdooRPCError || err instanceof OdooConnectionError) {
      return err;
    }

    // Network / fetch errors
    if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('network'))) {
      return new OdooConnectionError(err.message);
    }

    // RPC errors from Odoo (usually have faultCode)
    if (err instanceof Error) {
      const faultCode = (err as unknown as Record<string, unknown>).faultCode;
      if (faultCode !== undefined) {
        return new OdooRPCError(err.message, faultCode as string | number);
      }
      // Generic Odoo/RPC error
      return new OdooRPCError(err.message);
    }

    return new OdooConnectionError(String(err));
  }
}
