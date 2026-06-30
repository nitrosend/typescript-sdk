import { Resource } from '../resource.js';
import type { Suppression, SuppressionListParams } from '../types.js';
import type { PaginatedResponse } from '../pagination.js';

export class Suppressions extends Resource<Suppression, never, never> {
  protected get path() { return '/v1/my/suppressions'; }
  protected get paginated() { return true; }

  override async list(params?: SuppressionListParams): Promise<PaginatedResponse<Suppression>> {
    return super.list(params as Record<string, unknown>) as Promise<PaginatedResponse<Suppression>>;
  }
}
