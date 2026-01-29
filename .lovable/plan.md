

# FlowForge - Phase 2 & 3 Implementation Plan

Building on the solid foundation from Phase 1, this plan covers the core functionality that makes FlowForge a true workflow automation platform.

---

## Phase 2: Visual Workflow Builder

### 2.1 Core Dependencies
Add `@xyflow/react` (React Flow v12) for the node-based canvas - it's the industry standard used by n8n, BuildShip, and similar tools.

### 2.2 New Pages & Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/dashboard` | `Dashboard.tsx` | Workflow list, stats, quick actions |
| `/workflows` | `Workflows.tsx` | Full workflow management page |
| `/workflow/:id` | `WorkflowEditor.tsx` | The main canvas builder |
| `/workflow/new` | `WorkflowEditor.tsx` | Create new workflow |

### 2.3 Workflow Editor Architecture

```text
WorkflowEditor/
├── WorkflowEditor.tsx          # Main container
├── Canvas/
│   ├── FlowCanvas.tsx          # React Flow wrapper
│   ├── CustomNode.tsx          # Base node component
│   ├── CustomEdge.tsx          # Animated connection lines
│   └── MiniMap.tsx             # Navigation minimap
├── Sidebar/
│   ├── NodeLibrary.tsx         # Draggable node palette
│   ├── NodeCategory.tsx        # Grouped nodes (Triggers, Actions, Logic, AI)
│   └── SearchNodes.tsx         # Quick search
├── Panel/
│   ├── NodeConfigPanel.tsx     # Right-side configuration
│   ├── InputOutput.tsx         # Data schema preview
│   └── TestRunner.tsx          # Test node with sample data
└── Toolbar/
    ├── EditorToolbar.tsx       # Top toolbar
    ├── UndoRedo.tsx            # History controls
    └── ZoomControls.tsx        # Zoom in/out/fit
```

### 2.4 Node Types (Initial Set)

**Triggers (Start a workflow)**
- `WebhookTrigger` - Receive HTTP requests
- `ScheduleTrigger` - Cron-based timing
- `ManualTrigger` - Run on demand

**Actions (Do something)**
- `HttpRequest` - Call any API
- `CodeNode` - Execute JavaScript
- `DataTransform` - Map, filter, format data

**Logic (Control flow)**
- `IfElse` - Conditional branching
- `Switch` - Multiple conditions
- `Loop` - Iterate over arrays
- `Merge` - Combine data streams

**AI (Powered by Lovable AI)**
- `AIChat` - Send prompts to LLMs
- `AIExtract` - Parse unstructured data
- `AISummarize` - Condense content

### 2.5 State Management with Zustand

```text
stores/
├── workflowStore.ts    # Nodes, edges, workflow metadata
├── uiStore.ts          # Selected node, panel visibility, zoom
└── historyStore.ts     # Undo/redo stack
```

### 2.6 Key UI/UX Features

- **Drag & drop nodes** from sidebar to canvas
- **Connection validation** - prevent invalid connections
- **Animated edges** showing data flow direction
- **Mini-map** for navigation in large workflows
- **Command palette** (Cmd+K) for quick actions
- **Keyboard shortcuts** for power users
- **Auto-layout** for messy workflows

---

## Phase 3: AI-Powered Features

### 3.1 AI Assistant (Chat Interface)

A floating chat panel that helps users build workflows:

```text
components/ai/
├── AIAssistant.tsx        # Main floating panel
├── AIChatMessages.tsx     # Message history
├── AIInput.tsx            # User input with suggestions
└── WorkflowSuggestion.tsx # AI-generated workflow preview
```

**Capabilities:**
- "Create a workflow that..." → AI generates nodes + connections
- "What does this node do?" → Context-aware help
- "Fix this error" → Debug assistance
- "Optimize this workflow" → Suggestions

### 3.2 Backend: AI Edge Function

Create `supabase/functions/workflow-ai/index.ts`:
- Uses Lovable AI gateway
- System prompt trained on FlowForge concepts
- Tool calling for structured workflow generation

### 3.3 AI Node Configuration

AI nodes get special config panels with:
- Prompt template editor with variables
- Model selection (Gemini, GPT-5)
- Temperature/creativity slider
- Output format (text, JSON, etc.)

### 3.4 Smart Features

- **Auto-suggestions**: When you add a node, AI suggests the next logical step
- **Error detection**: AI analyzes workflow and warns about potential issues
- **Natural language to workflow**: Describe what you want, AI builds it

---

## Database Schema (Lovable Cloud)

```text
Tables:
├── workflows
│   ├── id (uuid, pk)
│   ├── user_id (uuid, fk to auth.users)
│   ├── name (text)
│   ├── description (text)
│   ├── nodes (jsonb)
│   ├── edges (jsonb)
│   ├── settings (jsonb)
│   ├── is_active (boolean)
│   ├── created_at (timestamp)
│   └── updated_at (timestamp)
│
├── workflow_runs
│   ├── id (uuid, pk)
│   ├── workflow_id (uuid, fk)
│   ├── status (enum: pending, running, success, failed)
│   ├── started_at (timestamp)
│   ├── finished_at (timestamp)
│   ├── input_data (jsonb)
│   ├── output_data (jsonb)
│   └── error_log (text)
│
└── workflow_templates
    ├── id (uuid, pk)
    ├── name (text)
    ├── description (text)
    ├── category (text)
    ├── nodes (jsonb)
    ├── edges (jsonb)
    └── is_public (boolean)
```

---

## Implementation Order

### Step 1: Foundation (Phase 2.1-2.2)
1. Install `@xyflow/react` and `zustand`
2. Create route structure and placeholder pages
3. Set up Zustand stores for workflow state

### Step 2: Canvas (Phase 2.3-2.4)
1. Build FlowCanvas with React Flow
2. Create CustomNode component with styling
3. Implement CustomEdge with animations
4. Add zoom controls and minimap

### Step 3: Node Library (Phase 2.5)
1. Create NodeLibrary sidebar
2. Implement all initial node types
3. Add drag-and-drop from library to canvas
4. Build node configuration panel

### Step 4: Persistence (Phase 2.6)
1. Enable Lovable Cloud
2. Create database tables
3. Implement save/load workflows
4. Add workflow list on dashboard

### Step 5: AI Integration (Phase 3)
1. Create AI edge function with Lovable AI
2. Build AI Assistant chat interface
3. Implement "generate workflow" from natural language
4. Add AI-powered suggestions

---

## New Files Summary

```text
src/
├── pages/
│   ├── Dashboard.tsx
│   ├── Workflows.tsx
│   └── WorkflowEditor.tsx
├── components/
│   ├── workflow/
│   │   ├── Canvas/
│   │   │   ├── FlowCanvas.tsx
│   │   │   ├── CustomNode.tsx
│   │   │   ├── CustomEdge.tsx
│   │   │   └── MiniMap.tsx
│   │   ├── Sidebar/
│   │   │   ├── NodeLibrary.tsx
│   │   │   └── NodeCategory.tsx
│   │   ├── Panel/
│   │   │   ├── NodeConfigPanel.tsx
│   │   │   └── TestRunner.tsx
│   │   └── Toolbar/
│   │       └── EditorToolbar.tsx
│   ├── dashboard/
│   │   ├── WorkflowCard.tsx
│   │   ├── StatsCards.tsx
│   │   └── RecentActivity.tsx
│   └── ai/
│       ├── AIAssistant.tsx
│       └── AIChatMessages.tsx
├── stores/
│   ├── workflowStore.ts
│   ├── uiStore.ts
│   └── historyStore.ts
├── types/
│   └── workflow.ts
└── lib/
    └── nodes/
        ├── index.ts
        ├── triggers.ts
        ├── actions.ts
        ├── logic.ts
        └── ai.ts
```

---

## Design Consistency

All new components will follow the established design system:
- Dark futuristic theme with electric blue/neon purple gradients
- Glassmorphism effects for floating panels
- Smooth Framer Motion animations
- JetBrains Mono for code/technical elements
- Consistent glow effects on interactive elements

---

Ready to build the workflow automation platform!

