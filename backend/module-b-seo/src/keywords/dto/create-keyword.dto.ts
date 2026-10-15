import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateKeywordDto {
  @IsString()
  @MinLength(1)
  term: string;

  @IsUrl({ require_protocol: true }, { message: 'targetUrl must be a valid URL, e.g. https://example.com' })
  targetUrl: string;

  @IsOptional()
  @IsString()
  note?: string; // not persisted yet, reserved for later — harmless to accept now
}