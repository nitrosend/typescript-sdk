// Verifies Nitrosend webhook requests. Nitrosend signs every event in the
// Standard Webhooks format (https://www.standardwebhooks.com): an HMAC-SHA256
// of `${webhook-id}.${webhook-timestamp}.${raw body}` keyed by the
// base64-decoded part of the webhook's `whsec_` secret, sent as
// `webhook-signature: v1,<base64>`.
import type { WebhookEvent } from './types.js';

const SECRET_PREFIX = 'whsec_';
const DEFAULT_TOLERANCE_SECONDS = 5 * 60;

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookVerificationError';
  }
}

export type WebhookHeaders =
  | Headers
  | Record<string, string | string[] | undefined>;

export interface VerifyWebhookOptions {
  /** How old a request may be, in seconds. Default 300. */
  toleranceSeconds?: number;
  /** The current time, for tests. */
  now?: Date;
}

/**
 * Checks a webhook request's signature and age, and returns the parsed event.
 * Pass the raw request body exactly as received, before any JSON parsing.
 * Throws WebhookVerificationError when the request did not come from
 * Nitrosend or is too old.
 */
export async function verifyWebhook(
  payload: string,
  headers: WebhookHeaders,
  secret: string,
  options: VerifyWebhookOptions = {},
): Promise<WebhookEvent> {
  const id = header(headers, 'webhook-id');
  const timestamp = header(headers, 'webhook-timestamp');
  const signatures = header(headers, 'webhook-signature');
  if (!id || !timestamp || !signatures) {
    throw new WebhookVerificationError('Missing webhook-id, webhook-timestamp or webhook-signature header');
  }

  const sentAt = Number(timestamp);
  const now = Math.floor((options.now ?? new Date()).getTime() / 1000);
  const tolerance = options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  if (!Number.isInteger(sentAt) || Math.abs(now - sentAt) > tolerance) {
    throw new WebhookVerificationError('Webhook timestamp is outside the tolerance');
  }

  const expected = await sign(`${id}.${timestamp}.${payload}`, secret);
  const matched = signatures
    .split(' ')
    .some((candidate) => {
      const [version, signature] = candidate.split(',', 2);
      return version === 'v1' && signature !== undefined && constantTimeEqual(signature, expected);
    });
  if (!matched) throw new WebhookVerificationError('Webhook signature does not match');

  return JSON.parse(payload) as WebhookEvent;
}

function header(headers: WebhookHeaders, name: string): string | undefined {
  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name) ?? undefined;
  }
  const record = headers as Record<string, string | string[] | undefined>;
  const key = Object.keys(record).find((candidate) => candidate.toLowerCase() === name);
  const value = key === undefined ? undefined : record[key];
  return Array.isArray(value) ? value[0] : value;
}

async function sign(content: string, secret: string): Promise<string> {
  const key = base64ToBytes(secret.startsWith(SECRET_PREFIX) ? secret.slice(SECRET_PREFIX.length) : secret);
  const subtle = globalThis.crypto?.subtle ?? (await import('node:crypto')).webcrypto.subtle;
  const cryptoKey = await subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(content));
  return bytesToBase64(new Uint8Array(digest));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index++) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
