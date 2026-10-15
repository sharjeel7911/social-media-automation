import { BadRequestException } from '@nestjs/common';

export enum PostStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHING = 'PUBLISHING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
}

export const ALLOWED_TRANSITIONS: Record<PostStatus, PostStatus[]> = {
  [PostStatus.DRAFT]: [PostStatus.PENDING_REVIEW, PostStatus.SCHEDULED],
  [PostStatus.PENDING_REVIEW]: [PostStatus.APPROVED, PostStatus.DRAFT],
  [PostStatus.APPROVED]: [PostStatus.SCHEDULED, PostStatus.DRAFT],
 
  [PostStatus.SCHEDULED]: [PostStatus.SCHEDULED, PostStatus.DRAFT, PostStatus.PUBLISHING],
  
  [PostStatus.PUBLISHING]: [PostStatus.PUBLISHED, PostStatus.FAILED, PostStatus.SCHEDULED],
  [PostStatus.PUBLISHED]: [],
  [PostStatus.FAILED]: [PostStatus.SCHEDULED, PostStatus.DRAFT],
};

export function assertTransition(from: PostStatus, to: PostStatus) {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new BadRequestException(`Cannot change status from ${from} to ${to}`);
  }
}