/** Thrown when authentication to Odoo fails or user is not authenticated */
export class OdooAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OdooAuthError';
  }
}

/** Thrown when Odoo returns a JSON-RPC error */
export class OdooRPCError extends Error {
  public readonly faultCode: string | number | undefined;

  constructor(message: string, faultCode?: string | number) {
    super(message);
    this.name = 'OdooRPCError';
    this.faultCode = faultCode;
  }
}

/** Thrown when the connection to Odoo fails (network/timeout) */
export class OdooConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OdooConnectionError';
  }
}
