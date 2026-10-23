import { Resource } from '../resource.js';
import type { Domain, CreateDomain, DomainListParams } from '../types.js';
import type { PaginatedResponse } from '../pagination.js';

export class Domains extends Resource<Domain, CreateDomain, never> {
  protected get path() { return '/v1/my/domains'; }
  protected get paginated() { return true; }

  override async list(params?: DomainListParams): Promise<PaginatedResponse<Domain>> {
    return super.list(params as Record<string, unknown>) as Promise<PaginatedResponse<Domain>>;
  }

  override async create(params: CreateDomain): Promise<Domain> {
    const { data } = await this.client.request<Domain>('POST', this.path, {
      body: { domain: params } as Record<string, unknown>,
    });
    return data;
  }

  /** Read receiving status for one exact inbox when a domain has several. */
  override async get(id: number | string, options?: { inboxId?: number }): Promise<Domain> {
    const { data } = await this.client.request<Domain>('GET', `${this.path}/${id}`, {
      query: options?.inboxId == null ? undefined : { inbox_id: options.inboxId },
    });
    return data;
  }

  async verify(id: number): Promise<Domain> {
    const { data } = await this.client.request<Domain>('POST', `${this.path}/${id}/verify`);
    return data;
  }

  override async delete(id: number | string): Promise<Domain> {
    await this.client.request<void>('DELETE', `${this.path}/${id}`);
    return undefined as unknown as Domain;
  }

  // No update method
  override async update(): Promise<Domain> {
    throw new Error('Domains cannot be updated');
  }
}
