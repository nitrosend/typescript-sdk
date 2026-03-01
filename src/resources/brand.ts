import type { NitrosendClient } from '../client.js';
import type { Brand, UpdateBrand } from '../types.js';

export class BrandResource {
  private readonly client: NitrosendClient;
  private readonly path = '/v1/my/brand';

  constructor(client: NitrosendClient) {
    this.client = client;
  }

  async get(): Promise<Brand | null> {
    const { data } = await this.client.request<{ brand: Brand | null } | Brand>('GET', this.path);
    if (data && 'brand' in data) return data.brand;
    return data as Brand;
  }

  async update(params: UpdateBrand): Promise<Brand> {
    const { data } = await this.client.request<Brand>('PUT', this.path, {
      body: params as Record<string, unknown>,
    });
    return data;
  }

  async scrape(url: string): Promise<{ status: string; url: string }> {
    const { data } = await this.client.request<{ status: string; url: string }>('POST', `${this.path}/scrape`, {
      body: { url },
    });
    return data;
  }
}
