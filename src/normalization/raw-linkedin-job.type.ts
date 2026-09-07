export interface RawLinkedInJob {
  id: string;
  title: string;
  companyName: string;
  companyUrl?: string;
  jobUrl: string;
  location?: string;
  listedAt?: string; // adjust once Person 1 confirms the real LinkedIn API field names
}