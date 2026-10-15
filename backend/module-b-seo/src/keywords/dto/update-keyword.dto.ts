import { IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class UpdateKeywordDto {
  @IsOptional()
  @IsUrl({ require_protocol: true })
  targetUrl?: string;

  @IsOptional()
  @IsBoolean()
  isTracked?: boolean; // pause/resume tracking without deleting history
}