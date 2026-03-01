import { Resource } from '../resource.js';
import type { Event, CreateEvent, EventListParams } from '../types.js';
import type { PaginatedResponse } from '../pagination.js';

export class Events extends Resource<Event, CreateEvent, never> {
  protected get path() { return '/v1/my/events'; }
  protected get paginated() { return true; }

  override async list(params?: EventListParams): Promise<PaginatedResponse<Event>> {
    return super.list(params as Record<string, unknown>) as Promise<PaginatedResponse<Event>>;
  }

  override async create(params: CreateEvent): Promise<Event> {
    const { idempotencyKey, ...body } = params;
    const { data } = await this.client.request<Event>('POST', this.path, {
      body: body as Record<string, unknown>,
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return data;
  }

  // No update method
  override async update(): Promise<Event> {
    throw new Error('Events cannot be updated');
  }
}
