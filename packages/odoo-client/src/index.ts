// Core client
export { ClubOSClient } from './client.js';

// Authentication helpers
export { createServiceClient } from './auth.js';

// Error classes
export { OdooAuthError, OdooRPCError, OdooConnectionError } from './errors.js';

// Types
export type { OdooConfig, OdooDomain, OdooDomainTuple, OdooSearchReadOptions } from './types.js';

// Base model
export { BaseModel } from './models/base.js';
