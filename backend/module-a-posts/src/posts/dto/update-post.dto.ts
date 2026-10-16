import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const PLATFORMS = [
  'linkedin', 'facebook', 'instagram', 'twitter',
  'tiktok', 'youtube', 'pinterest', 'gbp',
] as const;

export class UpdatePostDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(3000)
  content?: string;

  @IsOptional() @IsString() @MaxLength(2048)
  mediaUrl?: string;

  @IsOptional() @IsIn(PLATFORMS)
  platform?: (typeof PLATFORMS)[number];

  @IsOptional() @IsUrl()
  originalUrl?: string;

  @IsOptional() @IsString() @MaxLength(100)
  utmSource?: string;

  @IsOptional() @IsString() @MaxLength(100)
  utmMedium?: string;

  @IsOptional() @IsString() @MaxLength(200)
  utmCampaign?: string;

  @IsOptional() @IsBoolean()
  isEvergreen?: boolean;

  @IsOptional() @IsInt() @Min(1) @Max(365)
  recycleIntervalDays?: number;
}