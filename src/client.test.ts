import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Nitrosend, VERSION } from './index.js';

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

test('inboxes keep the native API envelopes, server quote and retry identity', async () => {
  const requests: { url: string; method?: string; body: unknown; key: string | null }[] = [];
  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : null,
      key: new Headers(init?.headers).get('Idempotency-Key') });
    return new Response(JSON.stringify(String(input).includes('/capacity')
      ? { offer: { quantity: 43, recurring_total_cents: 4300 } }
      : { id: 1, reply_available: false, status: 'archived' }), { status: 200 });
  };
  const ns = new Nitrosend({ apiKey: 'nskey_test_abc123', brandSid: 'brand_1' });
  await ns.inboxes.create({ domainId: 4, localPart: 'scout', displayName: 'Scout Alice' }, { idempotencyKey: 'new-scout' });
  assert.deepEqual(requests[0].body, { inbox: { domain_id: 4, local_part: 'scout', display_name: 'Scout Alice' } });
  assert.equal(requests[0].key, 'new-scout');
  const archived = await ns.inboxes.update(1, { status: 'archived' });
  assert.equal(archived.replyAvailable, false);
  const quote = await ns.inboxes.capacity(43);
  assert.equal(quote.offer?.recurringTotalCents, 4300);
  assert.ok(requests[2].url.endsWith('/v1/my/inboxes/capacity?quantity=43'));
  assert.equal('delete' in ns.inboxes, false);
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

test('campaign template attributes go out in snake_case, with the design left as written', async () => {
  let requestBody: unknown;
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(init?.body as string);
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const ns = new Nitrosend({ apiKey: 'nskey_test_abc123' });

  await ns.campaigns.update(14834, {
    templateAttributes: { id: 23507, ifVersion: 1, fromName: 'Ada', design: { sections: [{ blockType: 'text' }] } },
  });

  assert.deepEqual(requestBody, {
    template_attributes: { id: 23507, if_version: 1, from_name: 'Ada', design: { sections: [{ blockType: 'text' }] } },
  });
});

test('a campaign send carries the draft preconditions the endpoint requires', async () => {
  let requestBody: unknown;
  let requestUrl: string | undefined;
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = JSON.parse(init?.body as string);
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const ns = new Nitrosend({ apiKey: 'nskey_test_abc123' });

  await ns.campaigns.send(14931, {
    expectedCampaignUpdatedAt: '2026-10-22T11:23:58.123456Z',
    templateIfVersion: 3,
    deliverAt: '2026-10-22T12:00:00Z',
  });

  assert.ok(requestUrl?.endsWith('/v1/my/campaigns/14931/send'));
  assert.deepEqual(requestBody, {
    expected_campaign_updated_at: '2026-10-22T11:23:58.123456Z',
    template_if_version: 3,
    deliver_at: '2026-10-22T12:00:00Z',
  });
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

test('domain receiving status requests the selected inbox and preserves its identity', async () => {
  let requestUrl: string | undefined;
  globalThis.fetch = async (input) => {
    requestUrl = String(input);
    return new Response(JSON.stringify({ id: 41, inbound_setup: {
      method: 'provider_forwarding', status: 'pending', requires_inbox_selection: false,
      inbox: { id: 10, address: 'scout@example.com', status: 'active' },
    } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const ns = new Nitrosend('nskey_test_abc123');
  const domain = await ns.domains.get(41, { inboxId: 10 });
  assert.equal(new URL(requestUrl!).searchParams.get('inbox_id'), '10');
  assert.equal(domain.inboundSetup?.inbox?.id, 10);
  assert.equal(domain.inboundSetup?.requiresInboxSelection, false);
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
