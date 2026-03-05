import { Resource } from '../resource.js';
import type { Flow, CreateFlow, UpdateFlow, ListParams } from '../types.js';
import type { PaginatedResponse } from '../pagination.js';

export class Flows extends Resource<Flow, CreateFlow, UpdateFlow> {
  protected get path() { return '/v1/my/flows'; }
  protected get paginated() { return true; }

  override async list(params?: ListParams): Promise<PaginatedResponse<Flow>> {
    return super.list(params as Record<string, unknown>) as Promise<PaginatedResponse<Flow>>;
  }

  async spec(): Promise<Record<string, unknown>> {
    const { data } = await this.client.request<Record<string, unknown>>('GET', `${this.path}/spec`);
    return data;
  }
}
