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

  async send(params: CreateMessage, idempotencyKey?: string): Promise<Message> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const { data } = await this.client.request<Message>('POST', this.path, {
      body: params as unknown as Record<string, unknown>,
      headers,
    });
    return data;
  }
}
