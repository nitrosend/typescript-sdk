import { Resource } from '../resource.js';
import { verifyWebhook, type VerifyWebhookOptions, type WebhookHeaders } from '../webhook.js';
import type {
  ListParams,
  Webhook,
  WebhookCreateParams,
  WebhookDelivery,
  WebhookEvent,
  WebhookEventType,
  WebhookUpdateParams,
} from '../types.js';
import type { PaginatedResponse } from '../pagination.js';
import { parsePaginationHeaders } from '../pagination.js';

export class Webhooks extends Resource<Webhook, WebhookCreateParams, WebhookUpdateParams> {
  protected get path() { return '/v1/my/webhooks'; }
  protected get paginated() { return true; }

  override async list(params?: ListParams): Promise<PaginatedResponse<Webhook>> {
    return super.list(params as Record<string, unknown>) as Promise<PaginatedResponse<Webhook>>;
  }

  /** The webhook with its signing secret in full. */
  async reveal(id: number): Promise<Webhook> {
    const { data } = await this.client.request<Webhook>('GET', `${this.path}/${id}`, {
      query: { reveal: true },
    });
    return data;
  }

  /** Queues a sample event (default `email.delivered`), signed and retried like a real one. */
  async test(id: number, type?: WebhookEventType): Promise<WebhookDelivery> {
    const { data } = await this.client.request<WebhookDelivery>('POST', `${this.path}/${id}/test`, {
      body: type ? { type } : {},
    });
    return data;
  }

  /** The last 7 days of deliveries, newest first. */
  async deliveries(id: number, params?: ListParams): Promise<PaginatedResponse<WebhookDelivery>> {
    const { data, headers } = await this.client.request<WebhookDelivery[]>('GET', `${this.path}/${id}/deliveries`, {
      query: params as Record<string, unknown>,
    });
    return { data, pagination: parsePaginationHeaders(headers) };
  }

  /** Same as the `verifyWebhook` export, for code that already holds a client. */
  verify(payload: string, headers: WebhookHeaders, secret: string, options?: VerifyWebhookOptions): Promise<WebhookEvent> {
    return verifyWebhook(payload, headers, secret, options);
  }
}
