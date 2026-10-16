# Marketing Automation Platform (Monorepo)

A comprehensive Social Media & Marketing Automation Platform uniting frontends and backends across all four core architectural modules.

---

## 🏛️ Repository Architecture

This repository is organized as a clean **Monorepo** uniting:
1. **Frontend Desktop Application** (`apps/electron-desktop`): Unified Electron + React + TypeScript workspace housing all 4 modules under a single cohesive interface with unified navigation.
2. **Backend Microservices** (`backend/*`): Specialized NestJS services implementing high-performance business logic, data pipelines, scoring algorithms, and LinkedIn integrations.

```
social-media-automation/
├── apps/
│   └── electron-desktop/       # Unified Electron + React + TypeScript Desktop App
│       ├── electron/           # Main process, unified IPC channels, preload sandbox
│       ├── modules/            # Domain logic, SQLite database, service mocks & adapters
│       └── src/                # Modern UI with unified multi-module top navigation
│           ├── moduleA/        # Social Media Publisher (Calendar, Post Editor, Preview)
│           ├── moduleB/        # SEO Toolkit (Site Audit, Rank Tracker, Competitor Gap)
│           ├── components/     # Signal Desk Lead Generation Engine (Lead Grid, Outreach)
│           ├── moduleD/        # Unified Dashboard (Cross-module Analytics & Reporting)
│           └── pages/          # Individual Module Views (Dashboard, Posts, SEO, Leads)
│
├── backend/
│   ├── module-a-posts/         # NestJS Service: Post CRUD, Status Workflow, Scheduling
│   ├── module-b-seo/           # NestJS Service: SEO Audit Scorer, Technical Checks, Keywords
│   ├── module-c-leads/         # NestJS Service: Raw Job Ingestion, Normalization, Deduplication
│   └── backend/module-d-analytics/ # NestJS Service: Aggregation, Analytics, Reporting, Kanban
│
└── package.json                # Root npm workspaces orchestrator
```

---

## 📦 Modules Overview

| Module | Description | Frontend (`apps/electron-desktop`) | Backend (`backend/*`) |
| :--- | :--- | :--- | :--- |
| **Module A** | **Social Publisher** | Post editor with live LinkedIn preview, scheduler calendar, account connection. | NestJS Posts CRUD, state engine, scheduler. |
| **Module B** | **SEO Toolkit** | On-page & technical audit results, keyword rank tracker, competitor gap, Google Business Profile. | Audit engine & scoring algorithms, keyword provider integration, technical checkers. |
| **Module C** | **Signal Desk (Leads)** | Lead viewer, filtering & sorting, notes modal, AI outreach drafter, CSV exporter. | Raw job ingestion, deduplication, enrichment, and normalization pipeline. |
| **Module D** | **Unified Dashboard** | Cross-module metrics, health score rings, line charts, pipeline Kanban, executive reports. | Cross-module aggregation, analytics calculations, CSV/PDF report generators. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher recommended)

### 2. Desktop Application

To run the unified desktop application:

```bash
# Navigate to the desktop application workspace
cd apps/electron-desktop

# Install dependencies
npm install

# Start the desktop application in development mode (Vite + Electron)
npm run dev
```

To build production distributions:
```bash
npm run build
npm run dist
```

### 3. Run from root


- npm run dev:desktop
- npm run start:backend:analytics
- npm run start:backend:leads
- npm run start:backend:seo
- npm run start:backend:posts



---

