import { Resource } from '../resource.js';
import type { Campaign, CreateCampaign, UpdateCampaign, SendCampaign, ListParams, SendTestParams, SendTestResult, SubjectVersionRequest } from '../types.js';
import type { PaginatedResponse } from '../pagination.js';
import { idempotencyHeader } from '../utils.js';

export class Campaigns extends Resource<Campaign, CreateCampaign, UpdateCampaign> {
  protected get path() { return '/v1/my/campaigns'; }
  protected get paginated() { return true; }

  override async list(params?: ListParams): Promise<PaginatedResponse<Campaign>> {
    return super.list(params as Record<string, unknown>) as Promise<PaginatedResponse<Campaign>>;
  }

  async send(id: number, params: SendCampaign): Promise<Campaign> {
    const { data } = await this.client.request<Campaign>('POST', `${this.path}/${id}/send`, {
      body: { ...params },
    });
    return data;
  }

  /**
   * Asks for suggested alternatives to the campaign's subject line, for its
   * current content. Saving content already asks; use this when readiness
   * reports none. Asking again for the same content changes nothing.
   */
  async requestSubjectVersions(id: number): Promise<SubjectVersionRequest> {
    const { data } = await this.client.request<SubjectVersionRequest>('POST', `${this.path}/${id}/subject_versions`);
    return data;
  }

  async sendTest(id: number, params: SendTestParams = {}): Promise<SendTestResult> {
    const { idempotencyKey, ...body } = params;
    const { data } = await this.client.request<SendTestResult>('POST', `${this.path}/${id}/send_test`, {
      body: body as Record<string, unknown>,
      headers: idempotencyHeader(idempotencyKey),
    });
    return data;
  }

  async duplicate(id: number, params?: { cancelSource?: boolean }): Promise<Campaign> {
    const body = params?.cancelSource ? { cancel_source: true } : undefined;
    const { data } = await this.client.request<Campaign>('POST', `${this.path}/${id}/duplicate`, {
      body: body as Record<string, unknown> | undefined,
    });
    return data;
  }
}
