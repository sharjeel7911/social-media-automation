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
  'linkedin',
  'facebook',
  'instagram',
  'twitter',
  'tiktok',
  'youtube',
  'pinterest',
  'gbp',
] as const;

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  mediaUrl?: string;

  /** Target social platform. Defaults to 'linkedin'. */
  @IsOptional()
  @IsIn(PLATFORMS)
  platform?: (typeof PLATFORMS)[number];

  @IsOptional()
  @IsIn(['DRAFT', 'PENDING_REVIEW'])
  status?: 'DRAFT' | 'PENDING_REVIEW';

  // ---- UTM / link-shortening ----
  /** Original URL to shorten and tag with UTM parameters. */
  @IsOptional()
  @IsUrl()
  originalUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  utmSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  utmMedium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  utmCampaign?: string;

  // ---- Evergreen / recycling queue ----
  @IsOptional()
  @IsBoolean()
  isEvergreen?: boolean;

  /** Days between automatic re-publishes (only relevant when isEvergreen is true). */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  recycleIntervalDays?: number;
}