# @nitrosend/sdk

Node.js/TypeScript SDK for the [Nitrosend](https://nitrosend.com) API — manage contacts, send campaigns, build automation flows, and track events programmatically.

Fully typed. Zero dependencies. Node.js 18+.

All plans, including free plans, have full access to Nitrosend MCP/API/CLI. API access and SDK usage are not restricted to paid plans; plan limits apply to usage volume and paid add-ons.

## Installation

```bash
npm install @nitrosend/sdk
```

## Get your API key

1. Log in at [app.nitrosend.com](https://app.nitrosend.com)
2. Go to **Settings > API Keys**
3. Copy your live key (starts with `nskey_live_`)

## Server SDK vs. browser client

**`@nitrosend/sdk`** is the server SDK. Use it from Node, edge functions, or
any backend with your `nskey_live_…` secret key. It can read and modify your
full account.

**`@nitrosend/sdk/browser`** is the browser-safe public client. Use it in
frontend code with a `wpkey_live_…` public key. It can create contacts and
add them to lists you've allowed — and nothing else.

Never ship a `nskey_live_…` secret key in browser code. The browser export
will refuse to authenticate with one.

### Server (secret key)

```ts
import { Nitrosend } from '@nitrosend/sdk';

const ns = new Nitrosend('nskey_live_...');

await ns.contacts.create({ email: 'alice@example.com', firstName: 'Alice' });
```

### Browser (public key)

```ts
import { createNitrosendPublicClient } from '@nitrosend/sdk/browser';

const nitro = createNitrosendPublicClient({
  publicKey: process.env.NEXT_PUBLIC_NITROSEND_KEY!,
});

await nitro.contacts.signup({
  listId: 'list_…',
  email: 'subscriber@example.com',
});
```

## Quick Start

```ts
import { Nitrosend } from '@nitrosend/sdk';

const ns = new Nitrosend('nskey_live_...');

// Create a contact
const contact = await ns.contacts.create({
  email: 'alice@example.com',
  firstName: 'Alice',
});

// Fire an event (triggers any matching flows)
await ns.events.create({
  event: 'order_confirmed',
  contactEmail: 'alice@example.com',
  idempotencyKey: 'order-123',
  data: { orderId: 123, total: 49.99 },
});

// Send a campaign
const campaign = await ns.campaigns.create({ name: 'March Sale', channelType: 'email' });
await ns.campaigns.send(campaign.id);

// Send a transactional message (receipt, OTP, reset — no campaign needed)
const msg = await ns.messages.send({
  channel: 'email',
  to: 'alice@example.com',
  subject: 'Your order is confirmed',
  body: 'Thanks for your order!',
}, 'order-123-receipt'); // optional idempotency key
```

## Resources

| Resource | Methods |
| --- | --- |
| `ns.account` | `get`, `update` |
| `ns.contacts` | `list`\*, `get`, `create`, `update`, `delete` |
| `ns.campaigns` | `list`, `get`, `create`, `update`, `send`, `delete` |
| `ns.flows` | `list`, `get`, `create`, `update`, `delete`, `spec` |
| `ns.templates` | `list`, `get`, `update`, `sendTest`, `preview`, `spec` |
| `ns.events` | `list`\*, `get`, `create`, `delete` |
| `ns.domains` | `list`\*, `get`, `create`, `verify`, `delete` |
| `ns.brands` | `list`, `get`, `create`, `update`, `delete`, `scrape` |
| `ns.segments` | `list`, `get`, `create`, `update`, `delete`, `count` |
| `ns.lists` | `list`, `get`, `create`, `update`, `delete` |
| `ns.messages` | `list`\*, `get`, `send` |
| `ns.images` | `ingest`, `createDirectUpload` |

\* Paginated — returns `{ data, pagination }`.

## Image Media Assets

Images used in templates and campaigns should be stored as URLs, not inline
base64. For public remote images, use the URL directly or call `ingest` with
`imageUrl` when you want a Nitro-hosted copy. For local files, reserve a direct
upload first, PUT the bytes to the returned upload URL with its headers, then
ingest the returned `signedId`.

```ts
const upload = await ns.images.createDirectUpload({
  blob: {
    filename: 'hero.png',
    byteSize: fileSize,
    checksum: base64Md5,
    contentType: 'image/png',
  },
});

// PUT bytes to upload.directUpload.url with upload.directUpload.headers.

const asset = await ns.images.ingest({ signedId: upload.signedId });

console.log(asset.mediaUrl); // Use in image.src, product.image_url, logo_url, etc.
```

## Pagination

Paginated endpoints return data and pagination metadata:

```ts
import { Nitrosend } from '@nitrosend/sdk';

const ns = new Nitrosend('nskey_live_...');
const result = await ns.contacts.list({ page: 1, limit: 25 });

console.log(result.data);       // Contact[]
console.log(result.pagination); // { page, totalPages, totalCount, nextPage, prevPage }
```

## Error Handling

All errors are typed — use `instanceof` to handle specific cases:

```ts
import { Nitrosend, ValidationError, NotFoundError } from '@nitrosend/sdk';

const ns = new Nitrosend('nskey_live_...');

try {
  await ns.contacts.create({ email: 'invalid' });
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(err.validationErrors); // { email: ['is invalid'] }
  } else if (err instanceof NotFoundError) {
    console.log(err.message);
  }
}
```

## Configuration

```ts
const ns = new Nitrosend({
  apiKey: 'nskey_live_...',
  baseUrl: 'https://api.nitrosend.com', // default
  timeout: 30000,                        // ms, default
});
```

## License

MIT
