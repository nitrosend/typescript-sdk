import type { NitrosendClient } from '../client.js';
import type { Account, AudienceReach, UpdateAccount } from '../types.js';

export class AccountResource {
  private readonly client: NitrosendClient;
  private readonly path = '/v1/my/account';

  constructor(client: NitrosendClient) {
    this.client = client;
  }

  async get(): Promise<Account> {
    const { data } = await this.client.request<Account>('GET', this.path);
    return data;
  }

  /** How far one send to `audience` recipients gets on the current plan, and the listed plan that covers it. */
  async reach(audience: number): Promise<AudienceReach> {
    const { data } = await this.client.request<AudienceReach>('GET', `${this.path}/reach`, {
      query: { audience },
    });
    return data;
  }

  async update(params: UpdateAccount): Promise<Account> {
    const { data } = await this.client.request<Account>('PATCH', this.path, {
      body: params as Record<string, unknown>,
    });
    return data;
  }
}
