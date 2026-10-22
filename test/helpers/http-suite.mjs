import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHook } from 'node:async_hooks';
import { appendFileSync } from 'node:fs';
import { fixture, payload, wire, key, message, TIMEOUT, RELEASE } from './http-fixture.mjs';

export function registerSuite(sdk, arm, patched, evidence = undefined) {
  async function run(mode, check) {
    const timers = new Set();
    const hook = createHook({ init(_id, type, _trigger, resource) {
      if (type === 'Timeout' && resource._idleTimeout === TIMEOUT) timers.add(resource);
    } });
    hook.enable();
    const f = await fixture(mode);
    const c = new sdk.Nitrosend({ apiKey: 'synthetic-no-authority', brandSid: 'fixture-brand', baseUrl: f.base, timeout: TIMEOUT });
    const row = { arm, case: mode, patched, timeoutMs: TIMEOUT, releaseMs: RELEASE };
    const start = performance.now();
    try {
      await check(f, c, row);
      for (const r of f.state.requests) {
        assert.equal(r.headers.authorization, 'Bearer synthetic-no-authority');
        assert.equal(r.headers['x-brand-sid'], 'fixture-brand');
        assert.equal(r.headers['user-agent'], `nitrosend-sdk/${sdk.VERSION}`);
        assert.equal(r.headers.accept, 'application/json');
        if (r.method === 'POST') assert.equal(r.headers['content-type'], 'application/json');
      }
      row.result = 'pass';
    } catch (error) { row.result = 'fail'; row.error = error.stack; throw error; }
    finally {
      row.durationMs = Math.round(performance.now() - start);
      row.teardown = await f.close();
      hook.disable();
      assert.ok([...timers].every(timer => timer._destroyed), 'all attempt timers cleared or fired');
      row.attemptTimers = timers.size;
      row.attemptTimersRemaining = [...timers].filter(timer => !timer._destroyed).length;
      row.requests = f.state.requests.map(({ atMs, method, path, key, body }) => ({ atMs: Math.round(atMs), method, path, key, body }));
      row.events = f.state.events;
      if (evidence) appendFileSync(evidence, JSON.stringify(row) + '\n');
    }
  }
  function check(name, mode, fn) {
    test(`${arm}: ${name}`, { timeout: 5000, concurrency: false }, () => run(mode, fn));
  }
  const send = c => c.messages.send(payload, key);
  const posts = f => f.state.requests.filter(r => r.method === 'POST');
  async function failure(fn, predicate) {
    let error;
    await assert.rejects(fn, e => { error = e; return predicate(e); });
    return { name: error.name, code: error.code ?? null, statusCode: error.statusCode ?? null };
  }
  const timeout = e => e instanceof sdk.NitrosendError && e.code === 'TIMEOUT' && e.statusCode === 0;
  async function recover(f, c, row) {
    f.state.mode = 'healthy';
    row.recovery = await c.messages.get(42);
    assert.deepEqual(row.recovery, message);
    if (row.errorResult?.code === 'TIMEOUT') {
      assert.ok(f.state.events.some(e => e.type === 'response-close' && !e.ended), 'native abort closes the timed-out response before harness teardown');
      row.timeoutResponseClosedBeforeTeardown = true;
    }
  }
  function retries(f, count) {
    const requests = posts(f);
    assert.equal(requests.length, count);
    requests.forEach(r => { assert.equal(r.key, key); assert.equal(r.body, JSON.stringify(wire)); });
    const gaps = requests.slice(1).map((r, i) => r.atMs - requests[i].atMs);
    if (count > 1) assert.ok(gaps[0] >= 80, `100ms backoff observed ${gaps[0]}`);
    if (count > 2) assert.ok(gaps[1] >= 270, `300ms backoff observed ${gaps[1]}`);
    return gaps.map(Math.round);
  }
  check('correct useful result, readback, headers and query conversion', 'healthy', async (f, c, row) => {
    row.message = await send(c); assert.deepEqual(row.message, message);
    await recover(f, c, row);
    await c.contacts.list({ firstName: 'Local', page: 2 });
    assert.equal(f.state.requests.at(-1).path, '/v1/my/contacts?first_name=Local&page=2');
    assert.equal(posts(f).length, 1);
  });
  check('legitimate chunks complete inside deadline', 'healthy-chunks', async (f, c, row) => {
    assert.deepEqual(await send(c), message); assert.equal(posts(f).length, 1);
    await new Promise(resolve => setTimeout(resolve, TIMEOUT + 30));
    await recover(f, c, row);
  });
  check('slow headers timeout once, then same-client recovery', 'headers-slow', async (f, c, row) => {
    row.errorResult = await failure(() => send(c), timeout);
    assert.equal(posts(f).length, 1); await recover(f, c, row);
  });
  for (const mode of ['unfinished', 'slow-chunks']) {
    check(`${mode} body ${patched ? 'times out once and recovers' : 'exposes expected old limitation'}`, mode, async (f, c, row) => {
      const start = performance.now();
      if (patched) row.errorResult = await failure(() => send(c), timeout);
      else assert.deepEqual(await send(c), message);
      row.resultDurationMs = Math.round(performance.now() - start);
      if (patched) assert.ok(row.resultDurationMs < RELEASE - 60, 'settles before finite fixture release');
      else assert.ok(row.resultDurationMs >= RELEASE - 40, 'old body outlives attempt timeout');
      assert.equal(posts(f).length, 1);
      await recover(f, c, row);
      row.decision = patched ? 'TIMEOUT; original effect remains unknown' : 'expected-old-header-only-timeout';
    });
  }
  for (const mode of ['malformed', 'truncated']) {
    check(`${mode} JSON retains parse failure and retries, then recovers`, mode, async (f, c, row) => {
      row.errorResult = await failure(() => send(c), e => e instanceof SyntaxError && e.code !== 'TIMEOUT');
      row.retryGapsMs = retries(f, 3); await recover(f, c, row);
    });
  }
  check('malformed first attempt retries successfully', 'malformed-once', async (f, c, row) => {
    assert.deepEqual(await send(c), message); row.retryGapsMs = retries(f, 2);
  });
  check('body stream failure remains transport failure, then recovers', 'body-failure', async (f, c, row) => {
    row.errorResult = await failure(() => send(c), e => e instanceof TypeError && e.code !== 'TIMEOUT');
    row.retryGapsMs = retries(f, 3); await recover(f, c, row);
  });
  check('204 completes without JSON parsing', 'no-content', async (f, c) => {
    assert.equal(await send(c), undefined); assert.equal(posts(f).length, 1);
  });
  check('typed 422 never retries', 'validation', async (f, c, row) => {
    row.errorResult = await failure(() => send(c), e => e instanceof sdk.ValidationError && e.code === 'invalid_fixture' && e.statusCode === 422 && e.validationErrors.to[0] === 'fixture only');
    assert.equal(posts(f).length, 1);
  });
  check('transient 503 preserves original key and bytes', 'transient-503', async (f, c, row) => {
    assert.deepEqual(await send(c), message); row.retryGapsMs = retries(f, 2);
  });
  check('persistent 503 stops at three attempts with typed HTTP error', 'persistent-503', async (f, c, row) => {
    row.errorResult = await failure(() => send(c), e => e instanceof sdk.NitrosendError && e.statusCode === 503 && e.code === 'fixture_unavailable');
    row.retryGapsMs = retries(f, 3);
  });
  check('unfinished discarded 503 cannot block retry', 'unfinished-503', async (f, c, row) => {
    assert.deepEqual(await send(c), message); row.retryGapsMs = retries(f, 2);
    row.discardClosedBeforeResult = f.state.events.some(e => e.type === 'response-close' && !e.ended);
    if (patched) assert.equal(row.discardClosedBeforeResult, true);
  });
  check('last unfinished 503 body uses final attempt deadline', 'final-unfinished-503', async (f, c, row) => {
    row.errorResult = await failure(() => send(c), patched ? timeout : e => e instanceof sdk.NitrosendError && e.statusCode === 503);
    row.retryGapsMs = retries(f, 3);
  });
  check('transport loss retries then succeeds', 'transport-once', async (f, c, row) => {
    assert.deepEqual(await send(c), message); row.retryGapsMs = retries(f, 2);
  });
  check('persistent transport failure stops at three without timeout reclassification', 'transport', async (f, c, row) => {
    row.errorResult = await failure(() => send(c), e => e instanceof TypeError && e.code !== 'TIMEOUT');
    row.retryGapsMs = retries(f, 3);
  });
  check('committed unfinished result recovers original state without another POST', 'committed-unfinished', async (f, c, row) => {
    if (patched) row.errorResult = await failure(() => send(c), timeout);
    else assert.deepEqual(await send(c), message);
    assert.equal(posts(f).length, 1);
    row.originalState = await c.messages.get('original-key'); // Explicit fixture-only key lookup, not provider evidence.
    assert.deepEqual(row.originalState, { id: 42, originalKey: key, bodyBytes: JSON.stringify(wire) });
    assert.deepEqual(await c.messages.get(row.originalState.id), message);
    assert.equal(posts(f).length, 1);
    row.decision = 'fixture confirms original; no fresh-key resend';
  });
}
