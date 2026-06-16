import { Resource } from '../resource.js';
import type {
  DirectUpload,
  DirectUploadCreate,
  ImageAsset,
  IngestImage,
} from '../types.js';

export class Images extends Resource<ImageAsset, IngestImage, never> {
  protected get path() { return '/v1/my/images'; }

  async ingest(params: IngestImage): Promise<ImageAsset> {
    const { data } = await this.client.request<ImageAsset>('POST', this.path, {
      body: params as unknown as Record<string, unknown>,
    });
    return data;
  }

  async createDirectUpload(params: Omit<DirectUploadCreate, 'purpose'>): Promise<DirectUpload> {
    const { data } = await this.client.request<DirectUpload>('POST', '/v1/direct_uploads', {
      body: {
        purpose: 'image',
        ...params,
      },
    });
    return data;
  }
}
