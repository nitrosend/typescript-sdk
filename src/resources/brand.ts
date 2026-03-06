import type { NitrosendClient } from '../client.js';
import type { Brand, CreateBrand, UpdateBrand } from '../types.js';

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

  async get(id: number): Promise<Brand> {
    const { data } = await this.client.request<Brand>('GET', `${this.path}/${id}`);
    return data;
  }

  async create(params: CreateBrand): Promise<Brand> {
    const { data } = await this.client.request<Brand>('POST', this.path, {
      body: params as Record<string, unknown>,
    });
    return data;
  }

  async update(id: number, params: UpdateBrand): Promise<Brand> {
    const { data } = await this.client.request<Brand>('PATCH', `${this.path}/${id}`, {
      body: params as Record<string, unknown>,
    });
    return data;
  }

  async delete(id: number): Promise<void> {
    await this.client.request('DELETE', `${this.path}/${id}`);
  }

  async scrape(id: number, url: string): Promise<{ status: string; url: string }> {
    const { data } = await this.client.request<{ status: string; url: string }>('POST', `${this.path}/${id}/scrape`, {
      body: { url },
    });
    return data;
  }

  async getOnboarding(id: number): Promise<{ steps: Record<string, unknown>; progress: number }> {
    const { data } = await this.client.request<{ steps: Record<string, unknown>; progress: number }>('GET', `${this.path}/${id}/onboarding`);
    return data;
  }

  async completeOnboardingStep(id: number, step: string, metadata?: Record<string, unknown>): Promise<{ steps: Record<string, unknown>; progress: number }> {
    const body: Record<string, unknown> = { step };
    if (metadata) body.metadata = metadata;
    const { data } = await this.client.request<{ steps: Record<string, unknown>; progress: number }>('POST', `${this.path}/${id}/onboarding/steps`, {
      body,
    });
    return data;
  }
}
