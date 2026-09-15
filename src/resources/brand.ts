import type { NitrosendClient } from '../client.js';
import type {
  Brand,
  BrandSubdomainPreparationResponse,
  CreateBrand,
  HostedSenderAvailability,
  PrepareBrandSubdomainRequest,
  UpdateBrand,
} from '../types.js';

export class BrandResource {
  private readonly client: NitrosendClient;
  private readonly path = '/v1/my/brands';

  constructor(client: NitrosendClient) {
    this.client = client;
  }

  async list(): Promise<Brand[]> {
    const { data } = await this.client.request<Brand[]>('GET', this.path);
    return data;
  }

  async get(sid: string): Promise<Brand> {
    const { data } = await this.client.request<Brand>('GET', `${this.path}/${sid}`);
    return data;
  }

  async create(params: CreateBrand): Promise<Brand> {
    const { data } = await this.client.request<Brand>('POST', this.path, {
      body: params as Record<string, unknown>,
    });
    return data;
  }

  async update(sid: string, params: UpdateBrand): Promise<Brand> {
    const { data } = await this.client.request<Brand>('PATCH', `${this.path}/${sid}`, {
      body: params as Record<string, unknown>,
    });
    return data;
  }

  async prepareBrandSubdomain(
    sid: string,
    params?: PrepareBrandSubdomainRequest,
  ): Promise<BrandSubdomainPreparationResponse> {
    const { data } = await this.client.request<BrandSubdomainPreparationResponse>(
      'POST',
      `${this.path}/${sid}/prepare_sending`,
      params ? { body: params as Record<string, unknown> } : undefined,
    );
    return data;
  }

  async hostedSenderAvailability(sid: string, subdomain: string): Promise<HostedSenderAvailability> {
    const { data } = await this.client.request<HostedSenderAvailability>(
      'GET',
      `${this.path}/${sid}/hosted_sender_availability`,
      { query: { subdomain } },
    );
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
