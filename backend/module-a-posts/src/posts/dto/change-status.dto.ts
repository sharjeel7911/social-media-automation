import { IsIn } from 'class-validator';

export class ChangeStatusDto {
  @IsIn(['DRAFT', 'PENDING_REVIEW', 'APPROVED'])
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED';
}