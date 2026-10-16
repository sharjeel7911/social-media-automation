## Module B — SEO

| Person                          | Task                                      | Details                                                                                   |
| ------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| Person 1 — Frontend             | Keyword research screen                   | Search box and results table (volume, difficulty)                                         |
| Person 1 — Frontend             | Audit screen                              | URL/draft input with score breakdown                                                      |
| Person 1 — Frontend             | Rank-tracking chart                       | Rank over time, per keyword                                                               |
| Person 1 — Frontend             | Technical checks view                     | Sitemap, broken links, meta tag results                                                   |
| Person 1 — Frontend             | Weekly report view                        | AI can generate most of the React/UI code quickly                                         |
| Person 2 — SQLite + SEO backend | Database schema                           | Tracked keywords, keyword research cache, audits, rank history, technical checks, reports |
| Person 2 — SQLite + SEO backend | CRUD/query APIs                           | APIs for all of the above                                                                 |
| Person 2 — SQLite + SEO backend | On-page audit + scoring                   | No paid API needed — fetch URL/text, parse HTML, score title/meta/headings/alt text/links |
| Person 2 — SQLite + SEO backend | Technical checks                          | Sitemap presence, broken links, meta tags — no paid API needed                            |
| Person 2 — SQLite + SEO backend | Scheduling logic                          | Daily rank checks and weekly reports, following Module A's scheduler pattern              |
| Person 3 — External SEO data    | Keyword volume/difficulty + rank tracking | Requires a paid provider (DataForSEO/SEMrush/Ahrefs) and API key                          |
| Person 3 — External SEO data    | PageSpeed Insights                        | Google API key                                                                            |
| Person 3 — External SEO data    | Competitor content-gap analysis           | Usually uses the same paid keyword provider                                               |

Notes: This module is well suited to vibe coding, but API and database behavior need testing. External account setup and approval can slow down Person 3's work even if AI generates code quickly.

## Module D — Dashboard & Reporting

| Person   | Task                                          | Details                                                      |
| -------- | --------------------------------------------- | ------------------------------------------------------------ |
| Frontend | Home dashboard UI                             | Upcoming posts, latest leads, SEO snapshot, KPI widgets      |
| Frontend | Cross-platform analytics charts               | Impressions, engagement rate, follower growth, top posts     |
| Frontend | Kanban board UI                               | Lead pipeline visualization                                  |
| Frontend | Report view/export button                     | View reports and initiate exports                            |
| Frontend | PDF/CSV download UI                           | Download reports in PDF or CSV format                        |
| Backend  | Aggregation APIs                              | Pull data from Modules A, B, and C (posts, leads, SEO data)  |
| Backend  | Analytics storage + calculation logic         | Engagement rate, growth over time, top-performer ranking     |
| Backend  | Kanban pipeline-stage data model + update API | Store and update pipeline stages, synchronized with Module C |
| Backend  | PDF/CSV report generation                     | Weekly and monthly reports                                   |
| Backend  | Scheduling                                    | Automated report generation                                  |



---


-  LinkedIn Backend Integration — SQLite account storage, LinkedIn OAuth, LinkedIn publishing API?????? [CHECK IT SPECIFICALLY]

## 3.1 Module A — Social Media Scheduling & Publishing Engine
OAuth account connection to: Facebook Pages, Instagram Business, LinkedIn (Company Page + Personal Profile where the API allows), X/Twitter, TikTok Business, YouTube (Community posts/Shorts), Pinterest, and Google Business Profile.
Visual content calendar with drag-and-drop, list/grid/week views.
Bulk scheduling and CSV import for batch content creation.
Media library with basic crop/resize presets per platform's spec.
Per-platform post preview before publishing.
AI-assisted caption, hashtag, and best-time-to-post suggestions.
Evergreen content recycling / auto-repost queue.
Built-in link shortening with automatic UTM tagging for campaign tracking.
Draft → Pending Review → Approved → Scheduled approval workflow for team use.
Background scheduler (system-tray service) so scheduled posts fire on time even when the main window is closed.


## 3.4 Module D — Unified Dashboard, Lead CRM-lite & Analytics
Home dashboard: upcoming scheduled posts, latest leads, SEO health snapshot, engagement KPIs.
Cross-platform analytics: impressions, engagement rate, follower growth, top-performing posts.
Kanban-style lead pipeline view synced with Module C.
Exportable weekly/monthly PDF or CSV reports.
Optional CRM push (HubSpot / Pipedrive / Salesforce) — stretch goal, Phase 5+.





---

Statement of Work
Social Media Marketing Automation Platform — Windows Desktop Application
Project Name	Social Media Marketing Automation Platform (working title)
Prepared For	Internal / Development Team
Prepared By	Nabeel Khalid
Date	August 28, 2026
Version	1.0 — Draft
Document Type	Statement of Work (Internal Build Spec)

1. Project Overview
Today, running a serious social media marketing operation means stitching together a scheduling tool (Buffer/Hootsuite-style), a separate SEO suite, and manual, hour-by-hour searching for sales leads. This project builds a single Windows desktop application that consolidates all three functions into one automation suite: schedule and publish content across every major social platform, manage SEO from keyword to rank tracking, and automatically surface sales leads by scanning job postings that match a target buyer profile.
Worked example (Lead Generation): a company selling a virtual AI receptionist product enters the job title “remote receptionist” as a target signal. The app continuously scans job boards for postings matching that title — companies actively hiring a human receptionist are, by definition, in-market for an AI alternative — and compiles them into an exportable, de-duplicated lead list with company, role, location, and source link.
2. Objectives / Success Criteria
Publish and schedule content across all major social platforms from a single calendar.
Provide actionable SEO guidance (keyword research, on-page scoring, competitor gaps, rank tracking) without leaving the app.
Automatically surface qualified sales leads by scanning job postings that match a configurable target buyer profile.
Run as a signed, installable native Windows application — usable offline for drafting/review, online for publishing and fetching.
Reduce weekly manual marketing-ops time from an estimated ~10 hrs/week to under 2 hrs/week (refine with real baseline once measured).
3. Scope of Work
The platform is organized into four modules, described below.
# 3.1 Module A — Social Media Scheduling & Publishing Engine
OAuth account connection to: Facebook Pages, Instagram Business, LinkedIn (Company Page + Personal Profile where the API allows), X/Twitter, TikTok Business, YouTube (Community posts/Shorts), Pinterest, and Google Business Profile.
Visual content calendar with drag-and-drop, list/grid/week views.
Bulk scheduling and CSV import for batch content creation.
Media library with basic crop/resize presets per platform's spec.
Per-platform post preview before publishing.
AI-assisted caption, hashtag, and best-time-to-post suggestions.
Evergreen content recycling / auto-repost queue.
Built-in link shortening with automatic UTM tagging for campaign tracking.
Draft → Pending Review → Approved → Scheduled approval workflow for team use.
Background scheduler (system-tray service) so scheduled posts fire on time even when the main window is closed.
3.2 Module B — SEO Toolkit
Keyword research with search-volume/difficulty lookups via an integrated third-party data provider.
On-page SEO audit and content-optimization scoring for a given URL or draft.
Competitor content-gap analysis.
Rank tracking for target keywords over time.
Technical SEO checks: sitemap validation, broken links, meta tags, page speed (via PageSpeed Insights API).
Google Business Profile post and local-ranking snapshot.
Automated weekly SEO health report.
3.3 Module C — Lead Generation Engine (Job-Board Prospecting)
User defines a target buyer signal: one or more job titles/keywords (e.g. “virtual receptionist,” “remote receptionist,” “answering service coordinator”), with optional filters for location, remote-only, date posted, and industry.
Engine queries configured job sources and returns matching postings, prioritizing official APIs/feeds (see compliance note below).
Each result is normalized into a lead record: company name, job title, posting link, location, date posted, source, and — where legally available — a company domain for outreach.
De-duplication across sources, with optional enrichment via a third-party business-contact API (e.g. Hunter.io, Apollo), scoped as an optional paid add-on given data-privacy constraints.
Lead list with a status pipeline (New → Contacted → Replied → Qualified → Won/Lost), notes, and CSV/XLSX export.
Saved searches that re-run on a schedule (e.g. daily) and append only newly discovered postings.
AI-drafted outreach message generator seeded from the specific job posting's content.
Compliance Note — Job-Board Data Sourcing Several major job boards — notably LinkedIn Jobs and Indeed's own web UI — prohibit automated scraping in their Terms of Service and run active bot-detection. Module C is scoped to prioritize official APIs and public feeds (Indeed Publisher API, RemoteOK API, We Work Remotely feed, Google for Jobs structured data via Custom Search API, and public ATS job pages such as Greenhouse/Lever/Ashby) rather than scraping restricted platforms directly. Any LinkedIn data access requires LinkedIn's official Talent/Marketing Developer Platform under a formal partnership; this is tracked as an external dependency in Section 10, not assumed as in-scope engineering work.

# 3.4 Module D — Unified Dashboard, Lead CRM-lite & Analytics
Home dashboard: upcoming scheduled posts, latest leads, SEO health snapshot, engagement KPIs.
Cross-platform analytics: impressions, engagement rate, follower growth, top-performing posts.
Kanban-style lead pipeline view synced with Module C.
Exportable weekly/monthly PDF or CSV reports.
Optional CRM push (HubSpot / Pipedrive / Salesforce) — stretch goal, Phase 5+.
4. Out of Scope (v1)
Paid ad management (Facebook/Google Ads) — candidate for a future phase.
Direct-message / unified social inbox automation (auto-replies to DMs or comments).
Native mobile app (iOS/Android) — desktop-only for v1.
Building an in-house SEO keyword/ranking database from scratch — v1 integrates a licensed third-party data provider instead.
Direct scraping of LinkedIn or any source whose Terms of Service prohibit automated access (see Section 3.3).
5. Technical Architecture
App shell: Windows desktop app. Recommended stack is Electron + TypeScript/React, packaged as a signed .exe/.msi installer — it pairs naturally with the Node/Playwright tooling used for the lead-gen connectors and any assisted-publishing flows. .NET/WPF is a viable alternative for a more native Windows feel; the final choice is confirmed in Phase 0.
Local data store: Embedded SQLite for scheduled posts, leads, SEO data, and settings.
Credential vault: OAuth tokens and API keys encrypted at rest via Windows DPAPI / Credential Manager — never stored in plaintext.
Background scheduler: A lightweight system-tray/background service runs scheduled posts and saved lead searches without the main window open.
Integration layer: A “Publisher” adapter per social platform, so new platforms can be added without touching core scheduling logic.
Lead-gen engine: API/feed connectors first; a Playwright-based crawler module is reserved only for sources with no API and permissive robots.txt/ToS, with per-source rate limiting and an on/off toggle.
SEO engine: A thin integration layer over a licensed SEO data API (e.g. DataForSEO, SEMrush, or Ahrefs), plus Google Search Console and PageSpeed Insights for the free-tier checks — rather than building crawling/ranking infrastructure in-house.
Update mechanism: Auto-update channel (e.g. electron-updater) so fixes ship without a manual reinstall.
6. Data Privacy & Compliance Considerations
Storing any person-identifiable recruiter or company contact data triggers GDPR/CCPA-style obligations even in a single-user tool, once that data leaves the device (e.g. via an enrichment API). v1 should include a data-retention setting and a “delete lead” / export-and-purge flow.
Each social platform's API carries its own developer terms, app-review process, and rate limits (Meta App Review for Instagram/Facebook publishing, X API pricing tiers, TikTok Business API access approval, etc.) — these approvals are external dependencies with their own lead times, not purely engineering work.
All lead-sourcing stays within each source's Terms of Service; sources that prohibit automation (LinkedIn, Indeed's own web UI) are excluded from direct scraping per Section 3.3.
7. Deliverables
Installable, signed Windows application (.msi/.exe).
Full source code repository with README and setup documentation.
API/integration documentation, including a per-platform OAuth setup guide.
User guide (PDF).
Admin/configuration guide covering API keys, lead-source toggles, and scheduler settings.
8. Phased Delivery Plan
Phase	Focus	Key Outputs	Est. Duration
Phase 0	Discovery & Architecture	Finalized tech stack, data model, target platform list; developer-account/API applications submitted (Meta, X, TikTok, LinkedIn, SEO provider, job-board APIs)	2 weeks
Phase 1	Core Shell + Publishing MVP	App shell, OAuth account connection (Facebook/Instagram, LinkedIn, X), content calendar, manual + scheduled posting, background scheduler service	6–8 weeks
Phase 2	SEO Toolkit MVP	Keyword research, on-page audit & scoring, rank tracking (via licensed SEO data API), technical SEO checks	4–6 weeks
Phase 3	Lead Generation Engine	Job-source connectors, lead normalization & de-dup, saved searches, CSV/XLSX export, outreach-message generator	6–8 weeks
Phase 4	Dashboard, Analytics & CRM-lite	Unified dashboard, cross-platform analytics, lead pipeline (kanban) view, exportable reports	4 weeks
Phase 5	Beta Hardening & Release	Bug fixes, installer + auto-update, documentation, packaging & code signing	2–3 weeks

Total estimated duration: ~24–31 weeks (~6–7.5 months) for a small team building sequentially. This can compress with parallel workstreams if the team size in Section 9 increases.
9. Team & Roles Required
Product owner / PM — part-time throughout.
1–2 full-stack/desktop engineers (Electron/TypeScript or .NET).
1 backend/automation engineer (scheduler, API integrations, lead-gen connectors).
1 UI/UX designer — part-time, front-loaded in Phases 0–1.
QA/tester — part-time from Phase 1 onward.
10. Assumptions & Dependencies
The product owner handles developer-account registration and business verification for each social platform (Meta Business, X Developer, TikTok for Business, LinkedIn Marketing Developer Platform) — approval timelines are outside engineering's control and can range from days to several weeks.
A paid SEO data API subscription (e.g. DataForSEO/SEMrush/Ahrefs) is procured before Phase 2 begins.
Job-source API keys (e.g. Indeed Publisher API) are registered before Phase 3 begins.
The final target platform list (which of Facebook/Instagram/LinkedIn/X/TikTok/YouTube/Pinterest to launch with) is confirmed by the end of Phase 0.
This is a greenfield build — no existing codebase or design system to migrate from.
11. Risks & Mitigations
Risk	Impact	Mitigation
Social platform API approval delayed or denied	Delays publishing capability for that platform	Submit developer-account applications in Phase 0; adapter-pattern architecture lets a platform be added later without blocking the others
A job board changes its Terms of Service or blocks a data source	Lead-generation results degrade or a source goes dark	Multi-source design so no single source is a point of failure; per-source health monitoring and on/off toggles
SEO / enrichment third-party API costs scale with usage	Budget overrun	Cap usage per configured plan tier; surface live usage/cost in-app before it's incurred
Scope creep (paid ads, mobile app, inbox automation)	Timeline slip	Explicit Out-of-Scope section (Sec. 4); new asks go through a change-request note appended to this SOW

12. Acceptance Criteria (v1)
Successfully connect and publish to at least 3 social platforms (e.g. Facebook, Instagram, LinkedIn) from the app.
Scheduled posts publish within a 5-minute tolerance of their set time, with the app window closed and only the background service running.
Given a target keyword or URL, the SEO module returns keyword suggestions and an on-page score within 30 seconds.
Given a target job title (e.g. “virtual receptionist”), the lead-gen module returns at least 20 matching, de-duplicated postings from at least 2 sources within 2 minutes, exportable to CSV.
All stored API keys and OAuth tokens are encrypted at rest (verified via a security review).
13. Maintenance & Support
A 30-day post-launch bug-fix window is included. Ongoing maintenance is recommended as a separate, continuing effort beyond that window — social platform and job-board APIs change frequently, and the adapters in Modules A and C will need periodic upkeep to keep publishing and lead sourcing reliable.
Appendix A — Candidate Platforms & Data Sources
Social platforms: Facebook, Instagram, LinkedIn, X/Twitter, TikTok, YouTube, Pinterest, Google Business Profile.
SEO data: Google Search Console and PageSpeed Insights (free); DataForSEO / SEMrush / Ahrefs / Moz (paid — pick one as primary provider).
Job sources: Indeed Publisher API, RemoteOK API, We Work Remotely feed, Google for Jobs (via Custom Search API), public company ATS boards (Greenhouse, Lever, Ashby); LinkedIn via official partner API only, never direct scraping.