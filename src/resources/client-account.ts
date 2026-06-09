import type { NitrosendClient } from '../client.js';
import type { ClientAccount, CreateClientAccount, UpdateClientAccount } from '../types.js';

export class ClientAccountResource {
  private readonly client: NitrosendClient;
  private readonly path = '/v1/my/client_accounts';

  constructor(client: NitrosendClient) {
    this.client = client;
  }

  async list(): Promise<ClientAccount[]> {
    const { data } = await this.client.request<ClientAccount[]>('GET', this.path);
    return data;
  }

  async get(sid: string): Promise<ClientAccount> {
    const { data } = await this.client.request<ClientAccount>('GET', `${this.path}/${sid}`);
    return data;
  }

  async create(params: CreateClientAccount): Promise<ClientAccount> {
    const { data } = await this.client.request<ClientAccount>('POST', this.path, {
      body: params as Record<string, unknown>,
    });
    return data;
  }

  async update(sid: string, params: UpdateClientAccount): Promise<ClientAccount> {
    const { data } = await this.client.request<ClientAccount>('PATCH', `${this.path}/${sid}`, {
      body: params as Record<string, unknown>,
    });
    return data;
  }

  async delete(sid: string): Promise<void> {
    await this.client.request('DELETE', `${this.path}/${sid}`);
  }

  async scrape(sid: string, url: string): Promise<{ status: string; url: string }> {
    const { data } = await this.client.request<{ status: string; url: string }>('POST', `${this.path}/${sid}/scrape`, {
      body: { url },
    });
    return data;
  }

  async getOnboarding(sid: string): Promise<{ steps: Record<string, unknown>; progress: number }> {
    const { data } = await this.client.request<{ steps: Record<string, unknown>; progress: number }>('GET', `${this.path}/${sid}/onboarding`);
    return data;
  }

  async completeOnboardingStep(sid: string, step: string, metadata?: Record<string, unknown>): Promise<{ steps: Record<string, unknown>; progress: number }> {
    const body: Record<string, unknown> = { step };
    if (metadata) body.metadata = metadata;
    const { data } = await this.client.request<{ steps: Record<string, unknown>; progress: number }>('POST', `${this.path}/${sid}/onboarding/steps`, {
      body,
    });
    return data;
  }
}
