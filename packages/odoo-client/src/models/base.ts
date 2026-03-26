import type { ClubOSClient } from '../client.js';
import type { OdooDomain, OdooSearchReadOptions } from '../types.js';

/**
 * Generic base model for typed Odoo model operations.
 *
 * Extend this class for per-model wrappers (e.g., PartnerModel, BookingModel).
 * Provides typed CRUD methods that delegate to ClubOSClient.
 */
export class BaseModel<T extends Record<string, unknown> = Record<string, unknown>> {
  protected client: ClubOSClient;
  protected modelName: string;

  constructor(client: ClubOSClient, modelName: string) {
    this.client = client;
    this.modelName = modelName;
  }

  /** Search and read records with type safety */
  async search(
    domain: OdooDomain,
    fields: string[],
    options?: OdooSearchReadOptions
  ): Promise<T[]> {
    return this.client.searchRead<T>(this.modelName, domain, fields, options);
  }

  /** Read a single record by id. Returns null if not found. */
  async read(id: number, fields: string[]): Promise<T | null> {
    const records = await this.client.searchRead<T>(
      this.modelName,
      [['id', '=', id]],
      fields
    );
    return records.length > 0 ? records[0] : null;
  }

  /** Create a new record. Returns the new record id. */
  async create(values: Partial<T>): Promise<number> {
    return this.client.create(this.modelName, values as Record<string, unknown>);
  }

  /** Update an existing record by id. */
  async update(id: number, values: Partial<T>): Promise<boolean> {
    return this.client.write(this.modelName, [id], values as Record<string, unknown>);
  }

  /** Update multiple records by ids. */
  async updateMany(ids: number[], values: Partial<T>): Promise<boolean> {
    return this.client.write(this.modelName, ids, values as Record<string, unknown>);
  }

  /** Delete a record by id. */
  async delete(id: number): Promise<boolean> {
    return this.client.unlink(this.modelName, [id]);
  }

  /** Delete multiple records by ids. */
  async deleteMany(ids: number[]): Promise<boolean> {
    return this.client.unlink(this.modelName, ids);
  }
}
