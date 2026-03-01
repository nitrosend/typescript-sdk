import { Resource } from '../resource.js';
import type { Campaign, CreateCampaign, UpdateCampaign, SendCampaign } from '../types.js';

export class Campaigns extends Resource<Campaign, CreateCampaign, UpdateCampaign> {
  protected get path() { return '/v1/my/campaigns'; }

  async send(id: number, params?: SendCampaign): Promise<Campaign> {
    const { data } = await this.client.request<Campaign>('POST', `${this.path}/${id}/send`, {
      body: params as Record<string, unknown>,
    });
    return data;
  }
}
