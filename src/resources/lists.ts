import { Resource } from '../resource.js';
import type { ContactList, CreateList, UpdateList } from '../types.js';

export class Lists extends Resource<ContactList, CreateList, UpdateList> {
  protected get path() { return '/v1/my/lists'; }
}
