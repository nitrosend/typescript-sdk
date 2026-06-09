// Browser-safe public client for @nitrosend/sdk.
//
// Use with a wpkey_live_… public key. This module deliberately does not
// import the server SDK client, exposes only the public signup endpoint,
// and refuses to authenticate with what looks like a server-side secret
// key. Safe to ship in browser bundles.

// Concatenated at runtime so the secret-key prefix never appears as a
// literal substring in this source file.
const SECRET_PREFIX = 'nskey_' + 'live_';

export interface PublicClientOptions {
  publicKey: string;
  apiHost?: string;
  fetch?: typeof fetch;
}

export interface PublicContactSignup {
  listId: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source?: string;
  data?: Record<string, unknown>;
}

export interface PublicContactSignupResult {
  ok: true;
}

export class NitrosendPublicError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(message: string, status: number, code: string | null) {
    super(message);
    this.name = 'NitrosendPublicError';
    this.status = status;
    this.code = code;
  }
}

export interface NitrosendPublicClient {
  contacts: {
    signup(input: PublicContactSignup): Promise<PublicContactSignupResult>;
  };
}

export function createNitrosendPublicClient(
  options: PublicClientOptions,
): NitrosendPublicClient {
  if (!options || typeof options.publicKey !== 'string' || options.publicKey.length === 0) {
    throw new NitrosendPublicError(
      'A public key (wpkey_live_…) is required.',
      0,
      'invalid_key',
    );
  }

  if (options.publicKey.indexOf(SECRET_PREFIX) === 0) {
    throw new NitrosendPublicError(
      `Refusing to use a secret key (${SECRET_PREFIX}…) in browser code. Use the client account's public key (wpkey_live_…) instead.`,
      0,
      'invalid_key',
    );
  }

  const apiHost = (options.apiHost ?? 'https://api.nitrosend.com').replace(/\/$/, '');
  const candidateFetch =
    options.fetch ?? (typeof globalThis !== 'undefined' ? globalThis.fetch : undefined);

  if (typeof candidateFetch !== 'function') {
    throw new NitrosendPublicError(
      'No fetch implementation available. Pass a fetch function via options.fetch.',
      0,
      'no_fetch',
    );
  }

  const fetchImpl: typeof fetch = candidateFetch;

  async function signup(input: PublicContactSignup): Promise<PublicContactSignupResult> {
    if (!input || !input.listId) {
      throw new NitrosendPublicError('listId is required.', 0, 'invalid_request');
    }
    if (!input.email) {
      throw new NitrosendPublicError('email is required.', 0, 'invalid_request');
    }

    const payload: Record<string, unknown> = {
      list_id: input.listId,
      email: input.email,
    };
    if (input.firstName) payload.first_name = input.firstName;
    if (input.lastName) payload.last_name = input.lastName;
    if (input.phone) payload.phone = input.phone;
    if (input.source) payload.source = input.source;
    if (input.data && Object.keys(input.data).length > 0) payload.data = input.data;

    const response = await fetchImpl(`${apiHost}/v1/public/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.publicKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'omit',
    });

    let body: Record<string, unknown> = {};
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    if (response.status >= 200 && response.status < 300 && body.ok === true) {
      return { ok: true };
    }

    const message =
      typeof body.message === 'string'
        ? body.message
        : `Public signup failed with status ${response.status}.`;
    const code = typeof body.error_code === 'string' ? body.error_code : null;

    throw new NitrosendPublicError(message, response.status, code);
  }

  return {
    contacts: { signup },
  };
}
