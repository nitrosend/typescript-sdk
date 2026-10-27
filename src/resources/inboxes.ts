import type { NitrosendClient } from '../client.js';
import { parsePaginationHeaders, type PaginatedResponse } from '../pagination.js';
import type { Inbox, InboxCapacity, InboxCreate, InboxUpdate } from '../types.js';

/** Private-beta inboxes. API access and confirmed account capacity are required. */
export class Inboxes {
  constructor(private readonly client: NitrosendClient) {}

  async list(params?: { page?: number; per?: number; domainId?: number; status?: Inbox['status'] }): Promise<PaginatedResponse<Inbox>> {
    const { data, headers } = await this.client.request<Inbox[]>('GET', '/v1/my/inboxes', { query: params });
    return { data, pagination: parsePaginationHeaders(headers) };
  }

  async get(id: number): Promise<Inbox> {
    const { data } = await this.client.request<Inbox>('GET', `/v1/my/inboxes/${id}`);
    return data;
  }

  /** Creation never starts a purchase. Another address is a separate inbox. */
  async create(inbox: InboxCreate, options?: { idempotencyKey?: string }): Promise<Inbox> {
    const { data } = await this.client.request<Inbox>('POST', '/v1/my/inboxes', {
      body: { inbox }, headers: options?.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : undefined,
    });
    return data;
  }

  /** Archive preserves history and address ownership; restore requires capacity. */
  async update(id: number, inbox: InboxUpdate): Promise<Inbox> {
    const { data } = await this.client.request<Inbox>('PATCH', `/v1/my/inboxes/${id}`, { body: { inbox } });
    return data;
  }

  async capacity(quantity?: number): Promise<InboxCapacity> {
    const { data } = await this.client.request<InboxCapacity>('GET', '/v1/my/inboxes/capacity', {
      query: quantity == null ? undefined : { quantity },
    });
    return data;
  }
}
