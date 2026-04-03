

# Comprehensive SaaS Hardening & Feature Parity Plan

## Current State Assessment

After a thorough audit of the entire codebase, here is where Flow2Flow stands relative to SaaS best practices and n8n feature parity:

### What's Working Well
- Authentication (Google OAuth + email/password)
- Protected routes with session management
- RLS on all tables
- Visual workflow editor with drag-and-drop
- AI-powered workflow generation
- Undo/redo with keyboard shortcuts
- Version history, sharing, import/export
- Edge function execution engine with code sandboxing
- TFA settings page

### Critical Gaps vs SaaS Standards & n8n

```text
Category              Status    Impact
--------------------  --------  ------
Rate limiting         MISSING   High - no abuse protection on edge functions
Input validation      MISSING   High - no Zod validation on edge function inputs
Error boundaries      MISSING   Medium - app crashes on uncaught errors
Pagination            MISSING   Medium - dashboard hits 1000-row Supabase limit
Missing node types    PARTIAL   High - only 13 nodes vs n8n's 400+
                                (no Email, Slack, Google Sheets, DB, Wait, etc.)
Webhook endpoints     MISSING   High - webhook trigger has no real endpoint
Schedule execution    MISSING   High - cron triggers don't actually schedule
Credential vault      MISSING   High - no way to store API keys per workflow
Execution retry       MISSING   Medium - settings exist but not implemented
Real-time exec view   MISSING   Medium - claimed but not implemented
Node testing          MISSING   Medium - "Run Test" button does nothing
Password reset        MISSING   Medium - no forgot password flow
Usage/billing page    MISSING   Low - no usage tracking
Onboarding/tour       MISSING   Low - no first-time user guidance
```

## Plan

### Phase 1: Security & Input Validation (Critical)

**1.1 Edge Function Input Validation**
- Add Zod schemas to `run-workflow` and `workflow-ai` edge functions
- Validate `workflowId` as UUID, `message` as string with max length, `type` as enum
- Return 400 with structured errors on validation failure

**1.2 Rate Limiting Headers**
- Add rate limit response handling in the client for all edge function calls
- Display user-friendly messages when rate limited

**1.3 React Error Boundary**
- Add a global `ErrorBoundary` component wrapping the app
- Add a workflow-editor-specific error boundary to prevent canvas crashes from losing work

**1.4 Password Reset Flow**
- Add "Forgot password?" link on Login page
- Create a `/reset-password` page using `supabase.auth.resetPasswordForEmail()`
- Handle the recovery redirect with `supabase.auth.updateUser()`

### Phase 2: Execution Engine Hardening (High Priority)

**2.1 Fix Node Test Button**
- Wire up the "Run Test" button in `NodeConfigPanel` to actually execute a single node via a new `test-node` edge function
- Display real output in the test panel

**2.2 Implement Execution Retry Logic**
- Honor `maxRetries` and `retryOnFailure` settings in `run-workflow`
- Add exponential backoff between retries
- Log each retry attempt in `error_log`

**2.3 Add Missing Core Node Handlers**
- Add execution handlers for `data-transform` (currently mapped to `transform`), `switch`, `loop`, `merge`, `ai-extract`, `ai-summarize`
- These exist as UI nodes but have no execution logic

### Phase 3: Feature Parity Improvements

**3.1 Expand Node Library**
Add 8 high-value node types that cover the most common automation use cases (lead gen, content creation, AI assistant, etc.):
- **Email Send** (via edge function + external SMTP/API)
- **Delay/Wait** (pause execution for N seconds)
- **Set Variable** (assign values for downstream use)
- **Respond to Webhook** (return data to webhook caller)
- **Google Sheets** (read/write rows)
- **Slack Message** (send messages to channels)
- **Database Query** (query the project's own database)
- **Filter** (pass/reject items based on conditions)

Each new node type needs: definition in `definitions.ts`, config UI in `NodeConfigPanel`, and execution handler in `run-workflow`.

**3.2 Credential Vault**
- Create a `user_credentials` table (encrypted_value stored server-side only)
- Add a "Credentials" section in Settings to manage API keys for integrations
- Reference credentials by ID in node configs instead of raw values

**3.3 Dashboard Pagination**
- Add pagination to workflow listing (currently unbounded)
- Add pagination to RunHistory component

### Phase 4: UX Polish

**4.1 Real-time Execution View**
- Use Supabase Realtime to subscribe to `workflow_runs` status changes
- Highlight nodes on the canvas as they execute (green = success, red = failed)

**4.2 Onboarding Flow**
- Show a first-time tooltip tour when user creates their first workflow
- Pre-populate template gallery with 5-6 starter templates for common use cases

**4.3 Usage Dashboard**
- Add a simple usage card on Settings page showing workflow run count this month

## Technical Details

**Database migrations needed:**
- `user_credentials` table with RLS (user can only access own credentials)
- Add `retry_count` column to `workflow_runs`

**Edge functions to create/modify:**
- `test-node` - new function for single-node testing
- `run-workflow` - add retry logic, missing node handlers, credential resolution

**Files to create:**
- `src/components/auth/ResetPassword.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/pages/ResetPassword.tsx`

**Files to modify:**
- `src/lib/nodes/definitions.ts` - add new node definitions
- `src/components/workflow/Panel/NodeConfigPanel.tsx` - add config UIs + wire test button
- `supabase/functions/run-workflow/index.ts` - retry logic, new handlers, Zod validation
- `supabase/functions/workflow-ai/index.ts` - Zod validation
- `src/pages/Login.tsx` - add forgot password link
- `src/App.tsx` - add error boundary, reset password route
- `src/pages/Dashboard.tsx` - add pagination
- `src/pages/Settings.tsx` - add credentials management section

## Use Case Coverage After Implementation

| Use Case | Supported Nodes |
|---|---|
| Lead Generation | Webhook -> HTTP Request -> AI Extract -> Filter -> Email Send |
| Content Creation | Schedule -> HTTP Request -> AI Chat -> Transform -> Slack |
| AI Assistant | Webhook -> AI Chat -> Respond to Webhook |
| Data Pipeline | Schedule -> DB Query -> Transform -> Filter -> Google Sheets |
| Monitoring | Schedule -> HTTP Request -> If/Else -> Email Send |

