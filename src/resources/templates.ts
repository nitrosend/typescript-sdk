import type { NitrosendClient } from '../client.js';
import type { Template, TemplateSummary, UpdateTemplate, SendTestParams, SendTestResult, PreviewParams } from '../types.js';
import { idempotencyHeader } from '../utils.js';

export class Templates {
  private readonly client: NitrosendClient;
  private readonly path = '/v1/my/templates';

  constructor(client: NitrosendClient) {
    this.client = client;
  }

  async list(): Promise<TemplateSummary[]> {
    const { data } = await this.client.request<TemplateSummary[]>('GET', this.path);
    return data;
  }

  async get(id: number): Promise<Template> {
    const { data } = await this.client.request<Template>('GET', `${this.path}/${id}`);
    return data;
  }

  async update(id: number, params: UpdateTemplate): Promise<Template> {
    const { data } = await this.client.request<Template>('PATCH', `${this.path}/${id}`, {
      body: params as Record<string, unknown>,
    });
    return data;
  }

  async sendTest(id: number, params: SendTestParams = {}): Promise<SendTestResult> {
    const { idempotencyKey, ...body } = params;
    const { data } = await this.client.request<SendTestResult>('POST', `${this.path}/${id}/send_test`, {
      body: body as Record<string, unknown>,
      headers: idempotencyHeader(idempotencyKey),
    });
    return data;
  }

  async preview(params: PreviewParams): Promise<{ html: string }> {
    const { data } = await this.client.request<{ html: string }>('POST', `${this.path}/preview`, {
      body: { ...params },
    });
    return data;
  }

  async spec(): Promise<Record<string, unknown>> {
    const { data } = await this.client.request<Record<string, unknown>>('GET', `${this.path}/spec`);
    return data;
  }
}
