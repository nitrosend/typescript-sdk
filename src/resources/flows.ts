import { Resource } from '../resource.js';
import type { Flow, CreateFlow, UpdateFlow } from '../types.js';

export class Flows extends Resource<Flow, CreateFlow, UpdateFlow> {
  protected get path() { return '/v1/my/flows'; }

  async spec(): Promise<Record<string, unknown>> {
    const { data } = await this.client.request<Record<string, unknown>>('GET', `${this.path}/spec`);
    return data;
  }
}
