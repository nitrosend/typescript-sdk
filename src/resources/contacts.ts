import { Resource } from '../resource.js';
import type { Contact, CreateContact, UpdateContact, ContactListParams } from '../types.js';
import type { PaginatedResponse } from '../pagination.js';

export class Contacts extends Resource<Contact, CreateContact, UpdateContact> {
  protected get path() { return '/v1/my/contacts'; }
  protected get paginated() { return true; }

  override async list(params?: ContactListParams): Promise<PaginatedResponse<Contact>> {
    return super.list(params as Record<string, unknown>) as Promise<PaginatedResponse<Contact>>;
  }
}
