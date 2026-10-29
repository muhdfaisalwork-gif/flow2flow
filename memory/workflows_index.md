# Workflow Templates and Blueprint Index

This document catalogs the primary workflow topologies supported in Shadow Flow.

## AI & Autonomous Agent Workflows

### 1. Autonomous Deep Research
- **Identifier**: `bp-ai-deep-research`
- **Nodes**: Webhook Trigger -> Firecrawl Web Scrape -> Perplexity Research -> Claude 3.5 Sonnet Synthesis -> Slack Notification
- **Use Case**: Deep research reports synthesized from multiple web sources.

### 2. Autonomous Multi-Agent Swarm
- **Identifier**: `bp-ai-multi-agent-swarm`
- **Nodes**: Webhook Trigger -> Task Planner Agent -> Web Search Agent -> Code Execution Agent -> Quality Reviewer Agent -> Output Webhook
- **Use Case**: Coordinated multi-agent execution pipeline.

### 3. Document QA with Vector Search
- **Identifier**: `bp-ai-doc-qa`
- **Nodes**: File Upload -> Document Chunker -> Embedding Generator -> Vector Store (Qdrant/Pinecone) -> LLM Answer Synthesis
- **Use Case**: Retrieval-augmented generation for internal manuals and contracts.

## Email, CRM & Lead Generation Workflows

### 4. Lead Generation & Verification Pipeline
- **Identifier**: `bp-crm-lead-enrichment`
- **Nodes**: Webhook Lead Ingestion -> Email Validation (ZeroBounce) -> Company Enrichment (Clearbit) -> Lead Scoring Rule -> Slack Alert + CRM Sync (HubSpot)
- **Use Case**: Ingests new leads, validates email deliverability, enriches firmographic data, and notifies the sales team.

### 5. Inbound Support Ticket Triage
- **Identifier**: `bp-email-ticket-triage`
- **Nodes**: Email Trigger (Resend/Cloudflare) -> Sentiment Analysis -> Priority Categorization -> ZenDesk Ticket Creation -> Auto-Reply Email
- **Use Case**: Triages support tickets from `support@shadowflow.work` and routes urgency to team queues.

## DevOps & Infrastructure Workflows

### 6. Cloudflare Worker Deployment & Health Monitor
- **Identifier**: `bp-devops-cf-monitor`
- **Nodes**: Cron Schedule (every 5m) -> HTTP Health Check (`https://shadowflow.work/health`) -> Error Rate Evaluation -> Discord Webhook Alert
- **Use Case**: Continuous uptime monitoring and ping latency reporting.

### 7. Automated Database Backup to R2
- **Identifier**: `bp-devops-db-backup`
- **Nodes**: Nightly Cron -> Cloudflare D1 Dump -> Gzip Compression -> Cloudflare R2 Bucket Upload -> Backup Log Entry
- **Use Case**: Automated daily backup for production database states.
