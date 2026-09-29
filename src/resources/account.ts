import type { NitrosendClient } from '../client.js';
import type { Account, AudienceReach, SendingPause, UpdateAccount } from '../types.js';

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

  /**
   * Asks a person to review an automated sending hold (`recourse: 'review'`).
   * Opens one request per hold; repeating the call returns the same pause.
   * Requires an account admin.
   */
  async requestReview(params: { note?: string } = {}): Promise<SendingPause> {
    const { data } = await this.client.request<{ sendingPause: SendingPause }>('POST', `${this.path}/review_request`, {
      body: params as Record<string, unknown>,
    });
    return data.sendingPause;
  }

  async update(params: UpdateAccount): Promise<Account> {
    const { data } = await this.client.request<Account>('PATCH', this.path, {
      body: params as Record<string, unknown>,
    });
    return data;
  }
}
