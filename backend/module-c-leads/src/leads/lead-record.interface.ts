export interface LeadRecord {
  id: string;
  company: string;
  title: string;
  link: string;
  location?: string;
  datePosted?: string;
  source: string;
  domain?: string;
  fingerprint: string;
  firstSeenAt: string;
  lastSeenAt: string;
}