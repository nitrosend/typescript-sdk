import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Nitrosend, type CreateImport } from './index.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const cases: Array<{ name: string; input: Omit<CreateImport, 'signedId'>; expected: Record<string, unknown> }> = [
  { name: 'omitted columns', input: {}, expected: {} },
  { name: 'null columns', input: { columns: null }, expected: { columns: null } },
  { name: 'empty mapping', input: { columns: {} }, expected: { columns: {} } },
  {
    name: 'null and blank Skip entries alongside mapped columns',
    input: { columns: { email: 'Email', email_status: null, email_opt_out: '', opt_in_at: null, 'data.Case': 'Custom Header' } },
    expected: { columns: { email: 'Email', email_status: null, email_opt_out: '', opt_in_at: null, 'data.Case': 'Custom Header' } },
  },
  {
    name: 'existing string mapping',
    input: { columns: { email: 'Email', email_status: 'Subscribed', email_opt_out: 'Unsubscribed', opt_in_at: 'Opt In Date' } },
    expected: { columns: { email: 'Email', email_status: 'Subscribed', email_opt_out: 'Unsubscribed', opt_in_at: 'Opt In Date' } },
  },
  {
    name: 'JSON-string mapping',
    input: { columns: '{"email":"Email","email_status":null}' },
    expected: { columns: '{"email":"Email","email_status":null}' },
  },
];

for (const { name, input, expected } of cases) {
  test(`imports.create preserves ${name}`, async () => {
    const seen: Array<{ url: string; method: string | undefined; body: unknown }> = [];
    globalThis.fetch = async (url, init) => {
      seen.push({ url: String(url), method: init?.method, body: JSON.parse(String(init?.body)) });
      return new Response('{}', { status: 201, headers: { 'Content-Type': 'application/json' } });
    };
    const ns = new Nitrosend({ apiKey: 'nskey_test_synthetic', baseUrl: 'https://sdk.example.test' });

    await ns.imports.create({ signedId: 'synthetic-upload', ...input });

    assert.deepEqual(seen, [{
      url: 'https://sdk.example.test/v1/my/imports',
      method: 'POST',
      body: { signed_id: 'synthetic-upload', ...expected },
    }]);
  });
}

// Compile-time counterexamples: widening nullability must not accept cell data
// (booleans/numbers) or arrays in place of target-to-source-header mappings.
const invalidColumns: CreateImport['columns'][] = [
  // @ts-expect-error Boolean cells are not source header names.
  { email_status: false },
  // @ts-expect-error Numeric cells are not source header names.
  { opt_in_at: 123 },
  // @ts-expect-error The mapping must be an object, JSON string, or null.
  ['Email'],
];
void invalidColumns;
