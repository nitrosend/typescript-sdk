import { Resource } from '../resource.js';
import type { Message, CreateMessage, MessageListParams } from '../types.js';
import type { PaginatedResponse } from '../pagination.js';

export class Messages extends Resource<Message, CreateMessage> {
  protected get path() { return '/v1/my/messages'; }
  protected get paginated() { return true; }

  async list(params?: MessageListParams): Promise<PaginatedResponse<Message>> {
    const { data, headers } = await this.client.request<Message[]>(
      'GET', this.path, { query: params as Record<string, unknown> },
    );
    const { parsePaginationHeaders } = await import('../pagination.js');
    return { data, pagination: parsePaginationHeaders(headers) };
  }

  async create(params: CreateMessage): Promise<Message> {
    return this.send(params);
  }

  async send(params: CreateMessage, idempotencyKey?: string): Promise<Message> {
    const headers: Record<string, string> = {};
    const { idempotencyKey: bodyIdempotencyKey, ...body } = params;
    const key = idempotencyKey ?? bodyIdempotencyKey;
    if (key) headers['Idempotency-Key'] = key;
    const { data } = await this.client.request<Message>('POST', this.path, {
      body: body as unknown as Record<string, unknown>,
      headers,
    });
    return data;
  }
}
