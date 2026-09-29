// ============================================================================
// WHAT IS THIS FILE?
// This file is just a plain LIST of made-up, sample job leads (fake
// companies, fake job postings). It exists purely so the app has
// something to display the very first time you run it, before Person 1's
// real job-board connector is finished and feeding in real data.
//
// Once real leads are flowing in from the actual connector, this file (and
// the one line in main.ts that uses it) can simply be deleted.
// ============================================================================

import type { Lead } from "../types/job.js";
// ^ Borrowing the "Lead" shape so every sample entry below is filled out
//   correctly and TypeScript can catch any typos or missing fields.

// Stand-in for Person 1's connector + Person 2's normalizer output, matching
// the SOW's worked example ("virtual receptionist" buyer signal). Only used
// to seed an empty local database — delete freely once real data flows in.
export const seedLeads: Array<Omit<Lead, "created_at" | "updated_at" | "id">> = [
  // Each line below is one fake lead: a made-up company that's supposedly
  // hiring for a receptionist-type role, which is the kind of job posting
  // that suggests they might want an AI receptionist product instead.
  // "raw_job_id" and "source_id" are null because these aren't real
  // postings pulled from anywhere — they're just for demonstration.

  { raw_job_id: null, source_id: null, external_job_id: "harborline-1", company_name: "Harborline Dental Group", company_domain: "harborlinedental.com", job_title: "Remote Receptionist", job_url: "https://indeed.com/viewjob?jk=harborline", location: "Austin, TX", date_posted: "2026-08-29", description: null, industry: "Healthcare", remote_only: true, employment_type: "Full-time", deduplication_key: "harborline-1", status: "New" },
  { raw_job_id: null, source_id: null, external_job_id: "crestpoint-1", company_name: "Crestpoint Legal Partners", company_domain: "crestpointlaw.com", job_title: "Virtual Receptionist", job_url: "https://remoteok.com/l/crestpoint", location: "Remote", date_posted: "2026-08-28", description: null, industry: "Legal", remote_only: true, employment_type: "Full-time", deduplication_key: "crestpoint-1", status: "New" },
  { raw_job_id: null, source_id: null, external_job_id: "bluefin-1", company_name: "Bluefin Property Management", company_domain: "bluefinpm.com", job_title: "Answering Service Coordinator", job_url: "https://indeed.com/viewjob?jk=bluefin", location: "Tampa, FL", date_posted: "2026-08-27", description: null, industry: "Real Estate", remote_only: false, employment_type: "Part-time", deduplication_key: "bluefin-1", status: "Contacted" },
  { raw_job_id: null, source_id: null, external_job_id: "norwood-1", company_name: "Norwood Veterinary Clinic", company_domain: "norwoodvet.com", job_title: "Front Desk Receptionist (Remote OK)", job_url: "https://weworkremotely.com/listings/norwood", location: "Denver, CO", date_posted: "2026-08-26", description: null, industry: "Healthcare", remote_only: true, employment_type: "Full-time", deduplication_key: "norwood-1", status: "Contacted" },
  { raw_job_id: null, source_id: null, external_job_id: "alcove-1", company_name: "Alcove Coworking", company_domain: "alcove.co", job_title: "Remote Receptionist", job_url: "https://boards.greenhouse.io/alcove/jobs/1", location: "Remote", date_posted: "2026-08-25", description: null, industry: "Real Estate", remote_only: true, employment_type: "Full-time", deduplication_key: "alcove-1", status: "Replied" },
  { raw_job_id: null, source_id: null, external_job_id: "thirdrail-1", company_name: "Third Rail Auto Repair", company_domain: "thirdrailauto.com", job_title: "Virtual Receptionist / Scheduler", job_url: "https://indeed.com/viewjob?jk=thirdrail", location: "Columbus, OH", date_posted: "2026-08-24", description: null, industry: "Automotive", remote_only: true, employment_type: "Full-time", deduplication_key: "thirdrail-1", status: "Replied" },
  { raw_job_id: null, source_id: null, external_job_id: "meridian-1", company_name: "Meridian Home Health", company_domain: "meridianhomehealth.com", job_title: "Remote Receptionist", job_url: "https://jobs.lever.co/meridian/1", location: "Remote", date_posted: "2026-08-23", description: null, industry: "Healthcare", remote_only: true, employment_type: "Full-time", deduplication_key: "meridian-1", status: "Qualified" },
  { raw_job_id: null, source_id: null, external_job_id: "kettlewell-1", company_name: "Kettlewell & Sons Plumbing", company_domain: "kettlewellplumbing.com", job_title: "Answering Service Coordinator", job_url: "https://indeed.com/viewjob?jk=kettlewell", location: "Boise, ID", date_posted: "2026-08-22", description: null, industry: "Home Services", remote_only: false, employment_type: "Full-time", deduplication_key: "kettlewell-1", status: "Qualified" },
  { raw_job_id: null, source_id: null, external_job_id: "fernbrook-1", company_name: "Fernbrook Orthodontics", company_domain: "fernbrookortho.com", job_title: "Remote Receptionist", job_url: "https://remoteok.com/l/fernbrook", location: "Remote", date_posted: "2026-08-20", description: null, industry: "Healthcare", remote_only: true, employment_type: "Full-time", deduplication_key: "fernbrook-1", status: "Won" },
  { raw_job_id: null, source_id: null, external_job_id: "driftwood-1", company_name: "Driftwood Realty Group", company_domain: "driftwoodrealty.com", job_title: "Virtual Receptionist", job_url: "https://weworkremotely.com/listings/driftwood", location: "San Diego, CA", date_posted: "2026-08-19", description: null, industry: "Real Estate", remote_only: true, employment_type: "Full-time", deduplication_key: "driftwood-1", status: "Lost" },
  { raw_job_id: null, source_id: null, external_job_id: "palisade-1", company_name: "Palisade Insurance Advisors", company_domain: "palisadeinsurance.com", job_title: "Remote Receptionist", job_url: "https://boards.greenhouse.io/palisade/jobs/2", location: "Remote", date_posted: "2026-08-18", description: null, industry: "Insurance", remote_only: true, employment_type: "Full-time", deduplication_key: "palisade-1", status: "New" },
  { raw_job_id: null, source_id: null, external_job_id: "copperline-1", company_name: "Copperline Dental Studio", company_domain: "copperlinedental.com", job_title: "Front Desk / Answering Coordinator", job_url: "https://indeed.com/viewjob?jk=copperline", location: "Raleigh, NC", date_posted: "2026-08-17", description: null, industry: "Healthcare", remote_only: false, employment_type: "Full-time", deduplication_key: "copperline-1", status: "New" },
];
