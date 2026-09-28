import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  mediaUrl?: string;
}