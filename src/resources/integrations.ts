import type { NitrosendClient } from '../client.js';

export interface IntegrationSetupLink {
  purpose: 'connect' | 'migrate';
  provider?: string;
  brand: { id: number; name: string };
  url: string;
}

export class Integrations {
  constructor(private readonly client: NitrosendClient) {}

  async setupLink({ purpose = 'connect', provider }: {
    purpose?: IntegrationSetupLink['purpose'];
    provider?: string;
  } = {}): Promise<IntegrationSetupLink> {
    const { data } = await this.client.request<IntegrationSetupLink>('GET', '/v1/my/integrations/setup_link', {
      query: { purpose, provider },
    });
    return data;
  }
}
