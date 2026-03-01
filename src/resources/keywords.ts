import { Resource } from '../resource.js';
import type { Keyword, CreateKeyword, UpdateKeyword } from '../types.js';

export class Keywords extends Resource<Keyword, CreateKeyword, UpdateKeyword> {
  protected get path() { return '/v1/my/keywords'; }

  override async create(params: CreateKeyword): Promise<Keyword> {
    const body = mapActionParam(params);
    const { data } = await this.client.request<Keyword>('POST', this.path, { body });
    return data;
  }

  override async update(id: number | string, params: UpdateKeyword): Promise<Keyword> {
    const body = mapActionParam(params);
    const { data } = await this.client.request<Keyword>('PATCH', `${this.path}/${id}`, { body });
    return data;
  }
}

/** Maps params.action → params._action to avoid Ruby controller method conflict. */
function mapActionParam(params: CreateKeyword | UpdateKeyword): Record<string, unknown> {
  const { action, ...rest } = params;
  if (action !== undefined) {
    return { ...rest, _action: action };
  }
  return { ...params };
}
