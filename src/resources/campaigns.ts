import { Resource } from '../resource.js';
import type { Campaign, CreateCampaign, UpdateCampaign, SendCampaign, ListParams } from '../types.js';
import type { PaginatedResponse } from '../pagination.js';

export class Campaigns extends Resource<Campaign, CreateCampaign, UpdateCampaign> {
  protected get path() { return '/v1/my/campaigns'; }
  protected get paginated() { return true; }

  override async list(params?: ListParams): Promise<PaginatedResponse<Campaign>> {
    return super.list(params as Record<string, unknown>) as Promise<PaginatedResponse<Campaign>>;
  }

  async send(id: number, params?: SendCampaign): Promise<Campaign> {
    const { data } = await this.client.request<Campaign>('POST', `${this.path}/${id}/send`, {
      body: params as Record<string, unknown>,
    });
    return data;
  }

  async duplicate(id: number): Promise<Campaign> {
    const { data } = await this.client.request<Campaign>('POST', `${this.path}/${id}/duplicate`);
    return data;
  }
}
