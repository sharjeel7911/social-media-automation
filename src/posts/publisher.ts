import { Injectable } from '@nestjs/common';

export interface PublishInput {
  content: string;
  mediaUrl?: string | null;
}

export interface PublishResult {
  externalId: string;
  url?: string;
}

export interface Publisher {
  publish(post: PublishInput): Promise<PublishResult>;
}

export const PUBLISHER = 'PUBLISHER';

@Injectable()
export class MockPublisher implements Publisher {
  async publish(post: PublishInput): Promise<PublishResult> {
    console.log('MOCK PUBLISH ->', post.content);
    return { externalId: `mock-${Date.now()}` };
  }
}