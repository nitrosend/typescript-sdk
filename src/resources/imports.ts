import { Resource } from '../resource.js';
import type {
  CreateImport,
  DirectUpload,
  DirectUploadCreate,
  Import,
  ImportListParams,
  ImportSpec,
} from '../types.js';
import type { PaginatedResponse } from '../pagination.js';

export class Imports extends Resource<Import, CreateImport, never> {
  protected get path() { return '/v1/my/imports'; }
  protected get paginated() { return true; }

  override async list(params?: ImportListParams): Promise<PaginatedResponse<Import>> {
    return super.list(params as Record<string, unknown>) as Promise<PaginatedResponse<Import>>;
  }

  async spec(resource: 'contacts' = 'contacts'): Promise<ImportSpec> {
    const { data } = await this.client.request<ImportSpec>('GET', `${this.path}/spec`, {
      query: { resource },
    });
    return data;
  }

  async createDirectUpload(params: DirectUploadCreate): Promise<DirectUpload> {
    const { data } = await this.client.request<DirectUpload>('POST', '/v1/direct_uploads', {
      body: params as unknown as Record<string, unknown>,
    });
    return data;
  }

  async cancel(id: number | string): Promise<Import> {
    const { data } = await this.client.request<Import>('POST', `${this.path}/${id}/cancel`);
    return data;
  }
}
