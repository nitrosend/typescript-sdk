# @nitrosend/sdk

Node.js/TypeScript SDK for the [Nitrosend](https://nitrosend.com) API.

## Installation

```bash
npm install @nitrosend/sdk
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

// Fire an event
await ns.events.create({
  event: 'order_confirmed',
  contactEmail: 'alice@example.com',
  idempotencyKey: 'order-123',
  data: { orderId: 123, total: 49.99 },
});

// Send a campaign
const campaign = await ns.campaigns.create({ name: 'March Sale', channelType: 'email' });
await ns.campaigns.send(campaign.id);
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
| `ns.brand` | `get`, `update`, `scrape` |
| `ns.segments` | `list`, `get`, `create`, `update`, `delete`, `count` |
| `ns.lists` | `list`, `get`, `create`, `update`, `delete` |
| `ns.keywords` | `list`, `get`, `create`, `update`, `delete` |

\* Paginated — returns `{ data, pagination }`.

## Pagination

```ts
const result = await ns.contacts.list({ page: 1, limit: 25 });
console.log(result.data);       // Contact[]
console.log(result.pagination); // { page, totalPages, totalCount, nextPage, prevPage }
```

## Error Handling

```ts
import { Nitrosend, ValidationError, NotFoundError } from '@nitrosend/sdk';

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
