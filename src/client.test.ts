import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Nitrosend } from './index.js';
import { VERSION } from './version.generated.js';

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
