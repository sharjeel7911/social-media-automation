import { IsIn, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class RunAuditDto {
  // Provide either a URL or raw HTML/text content — not both, not neither.
  @ValidateIf((o) => !o.rawContent)
  @IsUrl({ require_protocol: true }, { message: 'url must be a valid URL, e.g. https://example.com' })
  url?: string;

  @ValidateIf((o) => !o.url)
  @IsString()
  rawContent?: string;

  @IsOptional()
  @IsString()
  targetKeyword?: string;
}