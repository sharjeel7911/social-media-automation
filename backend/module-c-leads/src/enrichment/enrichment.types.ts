export interface EnrichmentResult {
  domain: string;
  contactName?: string;
  contactEmail?: string;
  contactTitle?: string;
  source: 'hunter' | 'apollo';
}