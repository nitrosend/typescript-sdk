import { NitrosendClient, type ClientOptions } from './client.js';
import { AccountResource } from './resources/account.js';
import { Contacts } from './resources/contacts.js';
import { Campaigns } from './resources/campaigns.js';
import { Flows } from './resources/flows.js';
import { Templates } from './resources/templates.js';
import { Events } from './resources/events.js';
import { Domains } from './resources/domains.js';
import { ClientAccountResource } from './resources/client-account.js';
import { Segments } from './resources/segments.js';
import { Lists } from './resources/lists.js';
import { Messages } from './resources/messages.js';

export { NitrosendError, BadRequestError, AuthenticationError, PaymentRequiredError, ForbiddenError, NotFoundError, ValidationError, RateLimitError } from './errors.js';
export type { PaginatedResponse, PaginationMeta } from './pagination.js';
export type * from './types.js';

export class Nitrosend {
  readonly account: AccountResource;
  readonly contacts: Contacts;
  readonly campaigns: Campaigns;
  readonly flows: Flows;
  readonly templates: Templates;
  readonly events: Events;
  readonly domains: Domains;
  readonly clientAccounts: ClientAccountResource;
  readonly segments: Segments;
  readonly lists: Lists;
  readonly messages: Messages;

  constructor(apiKeyOrOptions: string | ClientOptions) {
    const options = typeof apiKeyOrOptions === 'string'
      ? { apiKey: apiKeyOrOptions }
      : apiKeyOrOptions;
    const client = new NitrosendClient(options);

    this.account = new AccountResource(client);
    this.contacts = new Contacts(client);
    this.campaigns = new Campaigns(client);
    this.flows = new Flows(client);
    this.templates = new Templates(client);
    this.events = new Events(client);
    this.domains = new Domains(client);
    this.clientAccounts = new ClientAccountResource(client);
    this.segments = new Segments(client);
    this.lists = new Lists(client);
    this.messages = new Messages(client);
  }
}
