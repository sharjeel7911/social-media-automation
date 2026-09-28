import { IsUrl } from 'class-validator';

export class RunTechnicalCheckDto {
  @IsUrl({ require_protocol: true }, { message: 'url must be a valid URL, e.g. https://example.com' })
  url: string;
}