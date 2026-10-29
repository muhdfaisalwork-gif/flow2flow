# Shadow Flow System Memory

## Architecture Overview

Shadow Flow is a browser-first visual workflow builder and execution engine compatible with n8n workflow formats. It runs in the browser using React, Vite, and Tailwind CSS, backed by a Cloudflare Worker and D1 SQLite database for remote storage and synchronization.

### Workflow Execution Engines

Shadow Flow supports three workflow generation and execution layers:

1. **Zero-Cost Heuristic Engine (Offline)**:
   - Location: `src/lib/copilot/aiEngine.ts` (`synthesizeWorkflowHeuristic`)
   - Cost: $0.00, runs completely in-memory without network requests.
   - Purpose: Direct pattern-based synthesis, graph repair, cycle resolution, and connection matching.
   - Integration: Queries the Graph Memory before running rule-based fallbacks and commits generated flows back into memory.

2. **Local Offline LLM (Ollama)**:
   - Endpoint: `http://localhost:11434/api/chat`
   - Primary model: `gemma4:latest`
   - Fallback models: `qwen3.6:latest`, `qwen2.5-coder:7b`
   - Integration: Offline local inference with Dynamic Subgraph Retrieval (GraphRAG) injecting user memory and node topologies.

3. **Built-in Cloud AI**:
   - Worker endpoint: `/api/copilot/chat` on `shadowflow.work`
   - Models: Groq LPU (`qwen/qwen3.8-27b`, `llama-3.3-70b-versatile`)
   - Integration: Receives GraphRAG memory context from client IndexedDB and D1 cloud memory.

### Core Node Types

- **Webhook / Trigger**: Inbound HTTP webhooks, cron schedules, manual start, event triggers.
- **AI & LLM**: OpenRouter, Groq, Ollama, OpenAI, Anthropic, HuggingFace inference nodes.
- **Condition & Logic**: If-Else conditional branches, switch routing, filter, merge, loop nodes.
- **Integration Nodes**: Slack, Telegram, Discord, Resend, SendGrid, GitHub, Google Sheets, Airtable, Notion, Stripe.
- **Code Execution**: JavaScript sandbox nodes with execution timeout protections.
- **Storage & State**: Key-value cache, D1 queries, local IndexedDB state nodes.

### Security Architecture

- **Authentication**: PBKDF2-SHA256 password hashing with 100,000 iterations and 16-byte random salt.
- **Two-Factor Authentication**: RFC 6238 TOTP with Base32 secrets and SHA-256 hashed one-time backup codes.
- **CORS Protection**: Restricted to `shadowflow.work`, `localhost:5173`, and Cloudflare Pages origins.
- **Authorization**: Tenant isolation via `user_id` foreign keys on all tables (`workflows`, `credentials`, `user_tfa`, `user_graph_memory`).
