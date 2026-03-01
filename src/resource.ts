import type { NitrosendClient, RequestOptions } from './client.js';
import type { PaginatedResponse } from './pagination.js';
import { parsePaginationHeaders } from './pagination.js';

export abstract class Resource<
  TResource,
  TCreate = never,
  TUpdate = never,
> {
  protected readonly client: NitrosendClient;

  constructor(client: NitrosendClient) {
    this.client = client;
  }

  protected abstract get path(): string;
  protected get paginated(): boolean { return false; }

  async list(params?: Record<string, unknown>): Promise<TResource[] | PaginatedResponse<TResource>> {
    const { data, headers } = await this.client.request<TResource[]>(
      'GET', this.path, { query: params } as RequestOptions,
    );
    if (this.paginated) {
      return { data, pagination: parsePaginationHeaders(headers) };
    }
    return data;
  }

  async get(id: number | string): Promise<TResource> {
    const { data } = await this.client.request<TResource>('GET', `${this.path}/${id}`);
    return data;
  }

  async create(params: TCreate extends never ? never : TCreate): Promise<TResource> {
    const { data } = await this.client.request<TResource>('POST', this.path, {
      body: params as Record<string, unknown>,
    });
    return data;
  }

  async update(id: number | string, params: TUpdate extends never ? never : TUpdate): Promise<TResource> {
    const { data } = await this.client.request<TResource>('PATCH', `${this.path}/${id}`, {
      body: params as Record<string, unknown>,
    });
    return data;
  }

  async delete(id: number | string): Promise<TResource> {
    const { data } = await this.client.request<TResource>('DELETE', `${this.path}/${id}`);
    return data;
  }
}
