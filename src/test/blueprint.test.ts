import { describe, it, expect, vi } from 'vitest';
import {
  parseN8nWorkflow,
  resolveN8nNodeMeta,
  autoLayoutWorkflow,
  serializeToN8nJson,
} from '@/lib/importer/n8nAdapter';
import {
  TEMPLATE_SEEDS,
  getAllTemplates,
  searchTemplates,
  getTemplateById,
} from '@/lib/templates/templateRegistry';
import {
  synthesizeWorkflowHeuristic,
  applyConversationalEdit,
  validateAndRepairWorkflow,
} from '@/lib/copilot/aiEngine';
import {
  evaluateExpression,
  validateSafeExpression,
  executeWorkflowDAG,
  type ExecutionContext,
} from '@/lib/runtime/executionEngine';

describe('1. Universal n8n Importer & Multi-Handle Topology Engine (n8nAdapter.ts)', () => {
  it('resolves 45+ service icons and canonical categories accurately', () => {
    const sheets = resolveN8nNodeMeta('n8n-nodes-base.googleSheets');
    expect(sheets.canonicalCategory).toBe('storage');
    expect(sheets.icon).toBe('Table');

    const agent = resolveN8nNodeMeta('@n8n/n8n-nodes-langchain.agent');
    expect(agent.canonicalCategory).toBe('ai');
    expect(agent.flowType).toBe('ai-agent');

    const claude = resolveN8nNodeMeta('@n8n/n8n-nodes-langchain.lmChatAnthropic');
    expect(claude.canonicalCategory).toBe('ai');
    expect(claude.defaultCredentialEnv).toBe('ANTHROPIC_API_KEY');

    const ifNode = resolveN8nNodeMeta('n8n-nodes-base.if');
    expect(ifNode.canonicalCategory).toBe('logic');
    expect(ifNode.flowType).toBe('if-else');
  });

  it('translates multi-output branching (output_0, output_1), LangChain AI sub-nodes, and missing credentials', () => {
    const rawN8n = {
      name: 'RAG Agent + Branching Test',
      nodes: [
        {
          id: 'sticky-1',
          name: 'Sticky Note',
          type: 'n8n-nodes-base.stickyNote',
          position: [-200, -100] as [number, number],
          parameters: { content: 'Architecture notes' },
        },
        {
          id: '1',
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          position: [0, 0] as [number, number],
          parameters: { httpMethod: 'POST', path: 'test' },
        },
        {
          id: '2',
          name: 'Chat Model',
          type: '@n8n/n8n-nodes-langchain.lmChatAnthropic',
          position: [200, -100] as [number, number],
          parameters: {},
          credentials: { anthropicApi: { id: 'ANTHROPIC', name: 'Anthropic' } },
        },
        {
          id: '3',
          name: 'Window Memory',
          type: '@n8n/n8n-nodes-langchain.memoryBufferWindow',
          position: [200, 100] as [number, number],
          parameters: {},
        },
        {
          id: '4',
          name: 'RAG Agent',
          type: '@n8n/n8n-nodes-langchain.agent',
          position: [400, 0] as [number, number],
          parameters: { text: 'Hello' },
        },
        {
          id: '5',
          name: 'Is Priority?',
          type: 'n8n-nodes-base.if',
          position: [600, 0] as [number, number],
          parameters: { condition: 'input.urgent', operator: 'equals', value: 'true' },
        },
        {
          id: '6',
          name: 'Slack Escalation',
          type: 'n8n-nodes-base.slack',
          position: [800, -80] as [number, number],
          parameters: { channel: '#urgent' },
          credentials: { slackApi: { id: 'SLACK', name: 'Slack' } },
        },
        {
          id: '7',
          name: 'Google Sheets Log',
          type: 'n8n-nodes-base.googleSheets',
          position: [800, 80] as [number, number],
          parameters: { operation: 'append' },
          credentials: { googleSheetsOAuth2Api: { id: 'SHEETS', name: 'Sheets' } },
        },
      ],
      connections: {
        'Webhook Trigger': {
          main: [[{ node: 'RAG Agent', type: 'main', index: 0 }]],
        },
        'Chat Model': {
          ai_languageModel: [[{ node: 'RAG Agent', type: 'ai_languageModel', index: 0 }]],
        },
        'Window Memory': {
          ai_memory: [[{ node: 'RAG Agent', type: 'ai_memory', index: 0 }]],
        },
        'RAG Agent': {
          main: [[{ node: 'Is Priority?', type: 'main', index: 0 }]],
        },
        'Is Priority?': {
          main: [
            [{ node: 'Slack Escalation', type: 'main', index: 0 }],
            [{ node: 'Google Sheets Log', type: 'main', index: 0 }],
          ],
        },
      },
    };

    const parsed = parseN8nWorkflow(rawN8n);
    // Sticky note filtered from executable nodes
    expect(parsed.nodes.length).toBe(7);
    expect(parsed.stickyNotes[0]).toContain('Architecture notes');
    expect(parsed.stats.aiSubNodesWired).toBe(2);
    expect(parsed.stats.multiBranchNodes).toBe(1);

    // Check RAG Agent has AI sub-node attachments
    const ragAgent = parsed.nodes.find((n) => n.data.label === 'RAG Agent')!;
    expect(ragAgent.data.aiSubNodes?.length).toBe(2);

    // Check multi-branch handles output_0 and output_1
    const ifNode = parsed.nodes.find((n) => n.data.label === 'Is Priority?')!;
    const trueEdge = parsed.edges.find((e) => e.source === ifNode.id && e.sourceHandle === 'output_0');
    const falseEdge = parsed.edges.find((e) => e.source === ifNode.id && e.sourceHandle === 'output_1');
    expect(trueEdge).toBeDefined();
    expect(falseEdge).toBeDefined();

    // Check missing credentials analyzer
    const envVars = parsed.missingCredentials.map((c) => c.envVarName);
    expect(envVars).toContain('ANTHROPIC_API_KEY');
    expect(envVars).toContain('SLACK_BOT_TOKEN');
    expect(envVars).toContain('GOOGLE_SHEETS_OAUTH');

    // Verify round-trip serialization back to n8n JSON
    const serialized = JSON.parse(serializeToN8nJson(parsed.name, parsed.nodes, parsed.edges));
    expect(serialized.nodes.length).toBe(7);
    expect(serialized.connections['Is Priority?'].main.length).toBe(2);
  });

  it("computes collision-free left-to-right coordinates using Kahn's algorithm", () => {
    const colliding = parseN8nWorkflow(
      {
        name: 'Colliding Nodes',
        nodes: [
          { id: '1', name: 'Start', type: 'n8n-nodes-base.webhook', position: [0, 0] },
          { id: '2', name: 'Step A', type: 'n8n-nodes-base.httpRequest', position: [0, 0] },
          { id: '3', name: 'Step B', type: 'n8n-nodes-base.slack', position: [0, 0] },
        ],
        connections: {
          Start: { main: [[{ node: 'Step A', type: 'main', index: 0 }]] },
          'Step A': { main: [[{ node: 'Step B', type: 'main', index: 0 }]] },
        },
      },
      { forceAutoLayout: true }
    );

    const layouted = autoLayoutWorkflow(colliding.nodes, colliding.edges);
    expect(layouted[0].position.x).toBe(100);
    expect(layouted[1].position.x).toBe(420); // 100 + 1 * 320
    expect(layouted[2].position.x).toBe(740); // 100 + 2 * 320
  });
});

describe('2. Enterprise Template Ecosystem (templateRegistry.ts)', () => {
  it('ships 120+ built-in production templates across all 6 canonical categories', () => {
    expect(TEMPLATE_SEEDS.length).toBeGreaterThanOrEqual(120);
    const all = getAllTemplates();
    expect(all.length).toBeGreaterThanOrEqual(120);

    const aiTemplates = searchTemplates({ category: 'AI & Autonomous Agents' });
    expect(aiTemplates.length).toBeGreaterThan(5);

    const deepResearch = getTemplateById('bp-ai-deep-research');
    expect(deepResearch).toBeDefined();
    expect(deepResearch!.nodes.length).toBeGreaterThanOrEqual(5);
  });
});

describe('3. Prompt-to-Flow AI Copilot & Self-Healing Engine (aiEngine.ts)', () => {
  it('synthesizes multi-branch workflows offline using the Zero-Cost Heuristic Engine', () => {
    const result = synthesizeWorkflowHeuristic(
      'When a Stripe webhook arrives, check if amount > 100, summarize with Claude 3.5, save to Supabase, else alert Slack'
    );
    expect(result.nodes.length).toBeGreaterThanOrEqual(4);
    expect(result.edges.length).toBeGreaterThanOrEqual(3);
    expect(result.modeUsed).toBe('heuristic');
  });

  it('refactors existing workflows conversationally without rebuilding from scratch', () => {
    const initial = synthesizeWorkflowHeuristic('When a webhook arrives, summarize with OpenAI and send to Slack');

    // 1. Insert a filter node between step 1 and step 2
    const inserted = applyConversationalEdit(
      'Insert a filter node between step 1 and step 2',
      initial.nodes,
      initial.edges
    );
    expect(inserted).not.toBeNull();
    expect(inserted!.nodes.length).toBe(initial.nodes.length + 1);

    // 2. Switch model to Claude 3.5 Sonnet
    const switched = applyConversationalEdit(
      'Switch model to Claude 3.5 Sonnet',
      inserted!.nodes,
      inserted!.edges
    );
    expect(switched).not.toBeNull();
    const claudeNode = switched!.nodes.find((n) => n.data.config.model === 'claude-3-5-sonnet-20241022');
    expect(claudeNode).toBeDefined();

    // 3. Add an error notification to Discord
    const withAlert = applyConversationalEdit(
      'Add an error notification to Discord',
      switched!.nodes,
      switched!.edges
    );
    expect(withAlert).not.toBeNull();
    expect(withAlert!.nodes.some((n) => n.data.label.includes('Discord'))).toBe(true);
  });

  it('repairs orphan nodes, strips dangling edges, and breaks ETL cycles via validateAndRepairWorkflow', () => {
    const initial = synthesizeWorkflowHeuristic('Webhook to Slack');
    const orphanNode = {
      ...initial.nodes[1],
      id: 'orphan-99',
      data: { ...initial.nodes[1].data, label: 'Orphan DB Node' },
    };
    const danglingEdge = {
      id: 'bad-edge',
      source: 'non-existent-source',
      target: 'non-existent-target',
    };

    const report = validateAndRepairWorkflow(
      [...initial.nodes, orphanNode],
      [...initial.edges, danglingEdge]
    );

    expect(report.danglingEdgesStripped).toBe(1);
    expect(report.orphanNodesWired).toBe(1);
    expect(report.edges.some((e) => e.target === 'orphan-99' || e.source === 'orphan-99')).toBe(true);
  });
});

describe('4. Sandboxed Microservices Task Runner & Safe Expression Evaluator (executionEngine.ts)', () => {
  it('evaluates {{ $json.field }}, {{ $node["Name"].json.data }}, and {{ $env.VAR }} safely and blocks RCE patterns', () => {
    const context: ExecutionContext = {
      input: { customer: { email: 'alice@example.com' }, amount: 250 },
      nodeOutputs: {
        'Webhook Trigger': { ticketId: 'TKT-900', priority: 'P0' },
      },
      nodeOutputsById: {},
      env: { SLACK_CHANNEL: '#secops' },
      variables: {},
    };

    const msg = evaluateExpression(
      'Ticket {{ $node["Webhook Trigger"].json.ticketId }} for {{ $json.customer.email }} -> {{ $env.SLACK_CHANNEL }}',
      context.input,
      context
    );
    expect(msg).toBe('Ticket TKT-900 for alice@example.com -> #secops');

    expect(() => validateSafeExpression('process.env.SECRET')).toThrow(/Security Violation/);
    expect(() => validateSafeExpression('Deno.run({ cmd: ["sh"] })')).toThrow(/Security Violation/);
    expect(() => validateSafeExpression('({}).__proto__.polluted = 1')).toThrow(/Security Violation/);
  });

  it('executes DAG deterministically and gates conditional branches (marking inactive branch as skipped)', async () => {
    const tpl = getTemplateById('bp-ai-ticket-classifier')!;
    const visitedStatuses: Array<{ nodeId: string; status: string }> = [];

    // Execute with urgency = "high" so output_0 (True -> Slack P0 Escalation) activates and output_1 (False -> Draft Auto-Resolution Email) is skipped
    const summary = await executeWorkflowDAG(tpl.nodes, tpl.edges, {
      initialInput: { urgency: 'high', summary: 'Database outage' },
      stepDelayMs: 0,
      onNodeStatusChange: ({ nodeId, status }) => {
        visitedStatuses.push({ nodeId, status });
      },
    });

    expect(summary.success).toBe(true);
    const slackNode = tpl.nodes.find((n) => n.data.label.includes('Slack'))!;
    const emailNode = tpl.nodes.find((n) => n.data.label.includes('Email'))!;

    expect(summary.nodeStates[slackNode.id]).toBe('success');
    expect(summary.nodeStates[emailNode.id]).toBe('skipped');
  });
});

describe('5. SaaS Subscription & License Engine (subscription.ts)', () => {
  it('activates Pro/Team via demo keys only when demo billing is enabled (dev/test)', async () => {
    const { SAAS_PLANS, activateLicenseKey, getStoredSubscription, isDemoBillingEnabled } = await import(
      '../lib/billing/subscription'
    );
    expect(SAAS_PLANS.free.monthlyPrice).toBe(0);
    expect(SAAS_PLANS.pro.monthlyPrice).toBe(19);
    expect(SAAS_PLANS.enterprise.monthlyPrice).toBe(49);
    expect(isDemoBillingEnabled()).toBe(true); // vitest runs with DEV=true

    expect((await activateLicenseKey('short')).valid).toBe(false);

    expect((await activateLicenseKey('F2F-PRO-2026-VIP')).valid).toBe(true);
    expect(getStoredSubscription().tier).toBe('pro');

    expect((await activateLicenseKey('F2F-TEAM-2026-AGENCY')).valid).toBe(true);
    expect(getStoredSubscription().tier).toBe('enterprise');
  });

  it('verifies real keys against the Lemon Squeezy License API and rejects invalid ones', async () => {
    const { activateLicenseKey, getStoredSubscription } = await import('../lib/billing/subscription');
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    // Invalid key -> rejected, stored tier unchanged
    localStorage.clear();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ valid: false, error: 'license_key not found.' }), { status: 404 })
    );
    const bad = await activateLicenseKey('38b1460a-5104-4067-a91d-77b872934d51');
    expect(bad.valid).toBe(false);
    expect(getStoredSubscription().tier).toBe('free');

    // Valid Team variant -> enterprise tier
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          valid: true,
          license_key: { status: 'active', expires_at: null },
          meta: { variant_name: 'Team & Agency (Monthly)', product_name: 'Flow2Flow' },
        }),
        { status: 200 }
      )
    );
    const good = await activateLicenseKey('38b1460a-5104-4067-a91d-77b872934d51');
    expect(good.valid).toBe(true);
    expect(getStoredSubscription().tier).toBe('enterprise');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.lemonsqueezy.com/v1/licenses/validate',
      expect.objectContaining({ method: 'POST' })
    );

    // Network failure -> graceful rejection
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    expect((await activateLicenseKey('38b1460a-5104-4067-a91d-77b872934d51')).valid).toBe(false);

    fetchMock.mockRestore();
  });
});
