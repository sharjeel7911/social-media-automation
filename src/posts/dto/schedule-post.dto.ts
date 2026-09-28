import { IsISO8601, Matches } from 'class-validator';

export class SchedulePostDto {
  @IsISO8601({ strict: true })
  @Matches(/(Z|[+-]\d{2}:?\d{2})$/, {
    message: 'scheduledAt must include a timezone, e.g. 2026-09-25T10:00:00Z',
  })
  scheduledAt: string;
}