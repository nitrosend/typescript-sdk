import { Resource } from '../resource.js';
import type { Segment, CreateSegment, UpdateSegment } from '../types.js';

export class Segments extends Resource<Segment, CreateSegment, UpdateSegment> {
  protected get path() { return '/v1/my/segments'; }

  async count(filters: Record<string, unknown>[]): Promise<{ count: number }> {
    const { data } = await this.client.request<{ count: number }>('POST', `${this.path}/count`, {
      body: { filters } as Record<string, unknown>,
    });
    return data;
  }
}
