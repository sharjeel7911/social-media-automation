import type { LeadRow } from '../leads/lead-row.type';

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export function isWithinLast48Hours(datePosted: string | null | undefined, now: Date = new Date()): boolean {
  if (!datePosted) return false;
  const postedTime = new Date(datePosted).getTime();
  if (Number.isNaN(postedTime)) return false;
  return now.getTime() - postedTime <= FORTY_EIGHT_HOURS_MS;
}

export function filterRecentLeads(leads: LeadRow[], now: Date = new Date()): LeadRow[] {
  return leads.filter((lead) => isWithinLast48Hours(lead.date_posted, now));
}