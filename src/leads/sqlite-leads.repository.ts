import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import type { LeadRow } from './lead-row.type';
import type { LeadsRepository } from './leads-repository.interface';

@Injectable()
export class SqliteLeadsRepository implements LeadsRepository, OnModuleInit {
  private db!: Database.Database;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const dbPath = this.configService.get<string>('SQLITE_DB_PATH') ?? './data/leads.db';
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT,
        raw_job_id INTEGER NOT NULL,
        source_id INTEGER NOT NULL,
        external_job_id TEXT NOT NULL,
        company_name TEXT NOT NULL,
        company_domain TEXT,
        job_title TEXT NOT NULL,
        job_url TEXT NOT NULL,
        location TEXT,
        date_posted TEXT,
        description TEXT,
        industry TEXT,
        remote_only INTEGER,
        employment_type TEXT,
        deduplication_key TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        updated_at TEXT,
        enrichment_contact_name TEXT,
        enrichment_contact_email TEXT,
        enrichment_contact_title TEXT,
        enrichment_source TEXT,
        enriched_at TEXT
      );
    `);
  }

  async findAll(): Promise<LeadRow[]> {
    return this.db.prepare('SELECT * FROM leads').all() as LeadRow[];
  }

  async findByFingerprint(deduplicationKey: string): Promise<LeadRow | null> {
    const row = this.db
      .prepare('SELECT * FROM leads WHERE deduplication_key = ?')
      .get(deduplicationKey) as LeadRow | undefined;
    return row ?? null;
  }

  async save(lead: LeadRow): Promise<LeadRow> {
    this.db
      .prepare(
        `INSERT INTO leads (raw_job_id, source_id, external_job_id, company_name, company_domain, job_title, job_url, location, date_posted, description, industry, remote_only, employment_type, deduplication_key, status, updated_at)
         VALUES (@raw_job_id, @source_id, @external_job_id, @company_name, @company_domain, @job_title, @job_url, @location, @date_posted, @description, @industry, @remote_only, @employment_type, @deduplication_key, @status, @updated_at)
         ON CONFLICT(deduplication_key) DO UPDATE SET status = @status, updated_at = @updated_at`,
      )
      .run({
        ...lead,
        company_domain: lead.company_domain ?? null,
        location: lead.location ?? null,
        date_posted: lead.date_posted ?? null,
        description: lead.description ?? null,
        industry: lead.industry ?? null,
        remote_only: lead.remote_only ? 1 : 0,
        employment_type: lead.employment_type ?? null,
        updated_at: lead.updated_at ?? new Date().toISOString(),
      });
    return lead;
  }

  async saveMany(leads: LeadRow[]): Promise<LeadRow[]> {
    const insert = this.db.transaction((items: LeadRow[]) => {
      for (const lead of items) {
        this.save(lead);
      }
    });
    insert(leads);
    return leads;
  }

    async findByRawJobId(rawJobId: number): Promise<LeadRow | null> {
    const row = this.db
      .prepare('SELECT * FROM leads WHERE raw_job_id = ?')
      .get(rawJobId) as LeadRow | undefined;
    return row ?? null;
  }
}