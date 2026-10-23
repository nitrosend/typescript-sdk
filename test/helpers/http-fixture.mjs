import http from 'node:http';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { channel } from 'node:diagnostics_channel';

export const payload = Object.freeze({ channel: 'email', to: 'reader@example.invalid', subject: 'Synthetic build result 42',
  body: 'Build 42: three checks passed.', fromName: 'Local qualification', replyTo: 'nobody@example.invalid', tags: { build_ref: 'fixture-42' } });
export const wire = { channel: 'email', to: payload.to, subject: payload.subject, body: payload.body,
  from_name: payload.fromName, reply_to: payload.replyTo, tags: payload.tags };
export const key = 'sdk-fixture-42';
export const message = { id: 42, status: 'queued', ...payload, createdAt: '2026-10-22T00:00:00Z' };
const wireMessage = { id: 42, status: 'queued', ...wire, created_at: message.createdAt };
export const TIMEOUT = 120;
export const RELEASE = 420;

export async function fixture(mode = 'healthy') {
  const sockets = new Set(), timers = new Set(), origins = [];
  const state = { mode, requests: [], effects: new Map(), aborted: 0, closed: 0, events: [] };
  const started = performance.now();
  let base;
  // Runs before native fetch dispatch; acquisition is done in a separate process.
  const observe = ({ request }) => {
    assert.equal(String(request.origin), base, 'only this owned loopback origin is admitted');
    origins.push(String(request.origin));
  };
  function later(ms, fn) {
    const timer = setTimeout(() => { timers.delete(timer); fn(); }, ms);
    timers.add(timer);
  }
  function json(res, status, value) {
    res.writeHead(status, { 'Content-Type': 'application/json', 'X-Fixture': 'sdk-test' });
    res.end(JSON.stringify(value));
  }
  const server = http.createServer(async (req, res) => {
    try {
      assert.equal(req.socket.remoteAddress, '127.0.0.1');
      assert.equal(req.headers.host, new URL(base).host);
      assert.ok(['/v1/my/messages', '/v1/my/messages/42', '/v1/my/messages/original-key', '/v1/my/contacts'].includes(req.url.split('?')[0]));
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks).toString();
      const record = { atMs: performance.now() - started, method: req.method, path: req.url,
        key: req.headers['idempotency-key'] ?? null, body, headers: req.headers };
      state.requests.push(record);
      res.on('close', () => {
        if (!res.writableEnded) state.aborted++;
        state.events.push({ type: 'response-close', atMs: performance.now() - started, path: req.url, ended: res.writableEnded });
      });
      if (req.method === 'GET') {
        if (req.url === '/v1/my/messages/original-key') {
          const saved = state.effects.get(key);
          return json(res, saved ? 200 : 404, saved ? { id: 42, original_key: key, body_bytes: saved } : {});
        }
        if (req.url === '/v1/my/messages/42') return json(res, 200, wireMessage);
        if (req.url.startsWith('/v1/my/contacts')) return json(res, 200, []);
      }
      assert.equal(req.method, 'POST');
      assert.equal(req.url, '/v1/my/messages');
      assert.equal(record.key, key);
      assert.equal(body, JSON.stringify(wire));
      const n = state.requests.filter(r => r.method === 'POST').length;
      if (state.mode === 'validation') return json(res, 422, { message: 'Synthetic rejection', code: 'invalid_fixture', validation_errors: { to: ['fixture only'] } });
      if (state.mode === 'transport' || (state.mode === 'transport-once' && n === 1)) return req.socket.destroy();
      if (state.mode === 'body-failure') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write('{"id":');
        return later(20, () => req.socket.destroy());
      }
      if (state.mode === 'malformed' || (state.mode === 'malformed-once' && n === 1)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end('not json');
      }
      if (state.mode === 'truncated') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end('{"id":');
      }
      if (state.mode === 'headers-slow') return later(RELEASE, () => json(res, 200, wireMessage));
      if (state.mode === 'no-content') { res.writeHead(204); return res.end(); }
      if (state.mode === 'persistent-503' || (state.mode === 'transient-503' && n === 1)) return json(res, 503, { message: 'Fixture unavailable', code: 'fixture_unavailable' });
      if (state.mode === 'unfinished-503' && n === 1) {
        res.writeHead(503, { 'Content-Type': 'application/json' }); res.flushHeaders();
        return later(RELEASE, () => jsonEnd(res, { code: 'fixture_unavailable' }));
      }
      if (state.mode === 'final-unfinished-503') {
        res.writeHead(503, { 'Content-Type': 'application/json' }); res.flushHeaders();
        return later(RELEASE, () => jsonEnd(res, { code: 'fixture_unavailable' }));
      }
      if (state.mode === 'committed-unfinished') state.effects.set(key, body);
      if (['unfinished', 'committed-unfinished', 'slow-chunks', 'healthy-chunks'].includes(state.mode)) {
        res.writeHead(201, { 'Content-Type': 'application/json' }); res.flushHeaders();
        const bytes = JSON.stringify(wireMessage);
        if (state.mode.endsWith('chunks')) {
          res.write(bytes.slice(0, 10));
          later(30, () => res.write(bytes.slice(10, 30)));
          later(state.mode === 'healthy-chunks' ? 60 : RELEASE, () => res.end(bytes.slice(30)));
        } else later(RELEASE, () => res.end(bytes)); // Finite old-control release, never an unbounded job.
        return;
      }
      return json(res, 201, wireMessage);
    } catch (error) { state.failure = error; res.destroy(); }
  });
  server.on('connection', socket => {
    sockets.add(socket);
    socket.once('close', () => { sockets.delete(socket); state.closed++; });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
  channel('undici:request:create').subscribe(observe);
  const originalFetch = globalThis.fetch;
  return { base, state, async close() {
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
    const closed = [...sockets].map(socket => once(socket, 'close'));
    const stopped = new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    for (const socket of sockets) socket.destroy();
    await stopped;
    await Promise.all(closed);
    channel('undici:request:create').unsubscribe(observe);
    assert.equal(globalThis.fetch, originalFetch);
    assert.equal(server.listening, false);
    assert.equal(sockets.size, 0);
    assert.equal(timers.size, 0);
    if (state.failure) throw state.failure;
    return { sockets: sockets.size, timers: timers.size, closedSockets: state.closed, abortedResponses: state.aborted, origins: [...new Set(origins)] };
  } };
}
function jsonEnd(res, value) { res.end(JSON.stringify(value)); }
