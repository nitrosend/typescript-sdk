import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Nitrosend, VERSION } from './index.js';
import * as sdk from './index.js';
import { registerSuite } from '../test/helpers/http-suite.mjs';

const PACKAGE_VERSION: string = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).version;
const USER_AGENT = `nitrosend-sdk/${PACKAGE_VERSION}`;

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function captureHeaders(): Headers[] {
  const seen: Headers[] = [];
  globalThis.fetch = async (_input, init) => {
    seen.push(new Headers(init?.headers));
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  return seen;
}

test('the generated version matches package.json', () => {
  assert.equal(VERSION, PACKAGE_VERSION);
});

test('hosted renames send the current hostname precondition and expose the updated brand', async () => {
  let requestBody: unknown;
  let requestUrl: string | undefined;
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = JSON.parse(init?.body as string);
    return new Response(JSON.stringify({ id: 1, sid: 'brand_1', email_from_email: 'hello@new-name.nitrosend.net',
      brand_subdomain: { fqdn: 'new-name.nitrosend.net', fqdn_changeable: true } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const ns = new Nitrosend({ apiKey: 'nskey_test_abc123' });
  const brand = await ns.brands.renameHostedSender('brand_1', {
    subdomain: 'new-name', expectedFqdn: 'old-name.nitrosend.net',
  });
  assert.ok(requestUrl?.endsWith('/v1/my/brands/brand_1/rename_hosted_sender'));
  assert.deepEqual(requestBody, { subdomain: 'new-name', expected_fqdn: 'old-name.nitrosend.net' });
  assert.equal(brand.emailFromEmail, 'hello@new-name.nitrosend.net');
  assert.equal(brand.brandSubdomain?.fqdnChangeable, true);
});

test('every request names the SDK with a versioned User-Agent', async () => {
  const seen = captureHeaders();
  const ns = new Nitrosend({ apiKey: 'nskey_test_abc123', brandSid: 'brand_1' });

  await ns.contacts.create({ email: 'alice@example.com' });
  await ns.messages.send(
    { channel: 'email', to: 'alice@example.com', subject: 'Hi', body: 'Hello' },
    'receipt-1',
  );

  assert.equal(seen.length, 2);
  for (const headers of seen) {
    assert.equal(headers.get('user-agent'), USER_AGENT);
    assert.equal(headers.get('authorization'), 'Bearer nskey_test_abc123');
    assert.equal(headers.get('x-brand-sid'), 'brand_1');
  }
  assert.equal(seen[1].get('idempotency-key'), 'receipt-1');
});

test('contact requests distinguish omitted consent from explicit true, false and null', async () => {
  const bodies: unknown[] = [];
  globalThis.fetch = async (_input, init) => {
    bodies.push(JSON.parse(init?.body as string));
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const ns = new Nitrosend({ apiKey: 'nskey_test_abc123' });

  await ns.contacts.create({ email: 'alice@example.com' });
  for (const optIn of [true, false, null]) {
    await ns.contacts.update(123, { email: 'alice@example.com', optIn });
  }
  assert.deepEqual(bodies, [
    { email: 'alice@example.com' },
    { email: 'alice@example.com', opt_in: true },
    { email: 'alice@example.com', opt_in: false },
    { email: 'alice@example.com', opt_in: null },
  ]);
});

test('messages.send refuses to send without an idempotency key', async () => {
  const seen = captureHeaders();
  const ns = new Nitrosend('nskey_test_abc123');
  const params = { channel: 'email' as const, to: 'alice@example.com', subject: 'Hi', body: 'Hello' };

  for (const key of [undefined, '', '  ']) {
    await assert.rejects(
      // @ts-expect-error the key is required; plain JavaScript can still omit it
      ns.messages.send(params, key),
      /messages\.send needs an idempotency key/,
    );
  }
  assert.equal(seen.length, 0);
});

test('a retried send carries the same idempotency key', async () => {
  const keys: Array<string | null> = [];
  globalThis.fetch = async (_input, init) => {
    keys.push(new Headers(init?.headers).get('idempotency-key'));
    const status = keys.length === 1 ? 502 : 201;
    return new Response(JSON.stringify({ id: 9, status: 'queued' }), { status, headers: { 'Content-Type': 'application/json' } });
  };
  const ns = new Nitrosend('nskey_test_abc123');

  const message = await ns.messages.send(
    { channel: 'email', to: 'alice@example.com', subject: 'Hi', html: '<p>Hello</p>' },
    'receipt-9',
  );

  assert.equal(message.id, 9);
  assert.deepEqual(keys, ['receipt-9', 'receipt-9']);
});

registerSuite(sdk, 'source', true);
