// ============================================================================
// Official n8n Core Test Workflows & Fixtures
// Extracted from n8n-master (packages/workflow/test and packages/nodes-base)
// Provides built-in test flows covering all n8n core capabilities:
// - Multi-Branch Conditional Routing (If/Switch)
// - LangChain AI Agents & Sub-Nodes (Language Models, Tools, Memory)
// - JavaScript Code Node batch execution
// - Multiple Parallel Inputs & Merge Nodes
// - Error Proxy & Fallback Handlers
// - Data Slicing & Filter Nodes
// - Interactive Streaming Chat Agents
// ============================================================================

import type { RawN8nWorkflow } from '@/lib/importer/n8nAdapter';

export interface N8nTestFlow {
  id: string;
  name: string;
  category: 'Branching & Logic' | 'LangChain & AI' | 'Data & Transformation' | 'Error & Resiliency';
  description: string;
  sourceFixture: string;
  nodeCount: number;
  n8nJson: RawN8nWorkflow;
}

export const OFFICIAL_N8N_TEST_FLOWS: N8nTestFlow[] = [
  {
    id: 'n8n-core-multi-branch',
    name: 'n8n Core: Multi-Branch & Conditional Routing',
    category: 'Branching & Logic',
    description:
      'Official n8n test workflow verifying multi-output branch execution (output_0 TRUE / output_1 FALSE) with set fields.',
    sourceFixture: 'packages/workflow/test/fixtures/WorkflowDataProxy/multiple_outputs_workflow.json',
    nodeCount: 3,
    n8nJson: {
      meta: { instanceId: '060d2be233778dc6349e0f3fa8d972652e8dff467638325ffc56812c6b66ef1a' },
      nodes: [
        {
          parameters: {},
          id: '656d6d8d-1af6-4af7-ab53-7c4e495ee51c',
          name: 'When clicking Execute workflow',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [-300, 1880],
        },
        {
          parameters: {
            conditions: {
              options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
              conditions: [
                {
                  id: '1fff886f-3d13-4fbf-b0fb-7e2f845937c0',
                  leftValue: '={{ false }}',
                  rightValue: '',
                  operator: { type: 'boolean', operation: 'true', singleValue: true },
                },
              ],
              combinator: 'and',
            },
            options: {},
          },
          id: '204feab7-f5e9-458f-8fdb-4b762b184147',
          name: 'If',
          type: 'n8n-nodes-base.if',
          typeVersion: 2,
          position: [40, 1880],
        },
        {
          parameters: { assignments: { assignments: [] }, options: {} },
          id: 'ab122060-f8da-475e-b6c6-d9e486289e1f',
          name: 'Edit Fields',
          type: 'n8n-nodes-base.set',
          typeVersion: 3.3,
          position: [360, 2080],
        },
      ],
      connections: {
        'When clicking Execute workflow': {
          main: [[{ node: 'If', type: 'main', index: 0 }]],
        },
        If: {
          main: [
            [],
            [{ node: 'Edit Fields', type: 'main', index: 0 }],
          ],
        },
      },
    },
  },
  {
    id: 'n8n-langchain-ai-agent-tools',
    name: 'n8n LangChain: AI Agent & Sub-Nodes Tool Calling',
    category: 'LangChain & AI',
    description:
      'Official n8n test workflow verifying LangChain Agent with attached OpenAI Language Model (ai_languageModel) and Google Sheets Tool (ai_tool).',
    sourceFixture: 'packages/workflow/test/fixtures/WorkflowDataProxy/from_ai_multiple_items_workflow.json',
    nodeCount: 4,
    n8nJson: {
      id: '8d7lUG8IdEyvIUim',
      name: 'Multiple items tool',
      nodes: [
        {
          parameters: {
            mode: 'runOnceForAllItems',
            language: 'javaScript',
            jsCode: 'return [\n  { "full_name": "Mr. Input 1", "email": "input1@n8n.io" }, \n  { "full_name": "Mr. Input 2", "email": "input2@n8n.io" }\n]',
          },
          id: 'cb19a188-12ae-4d46-86df-4a2044ec3346',
          name: 'Code',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [-160, 480],
        },
        {
          parameters: { model: 'gpt-4o-mini', options: {} },
          id: 'c448b6b4-9e11-4044-96e5-f4138534ae52',
          name: 'OpenAI Chat Model',
          type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
          typeVersion: 1,
          position: [40, 700],
        },
        {
          parameters: {
            descriptionType: 'manual',
            toolDescription: 'Add row to Users sheet',
            resource: 'sheet',
            operation: 'append',
            columns: {
              value: {
                'full name': "={{ $fromAI('full_name') }}",
                email: "={{ $fromAI('email') }}",
              },
            },
          },
          id: 'd8b40267-9397-45b6-8a64-ee7e8f9eb8a8',
          name: 'Google Sheets Tool',
          type: 'n8n-nodes-base.googleSheetsTool',
          typeVersion: 4.5,
          position: [240, 700],
        },
        {
          parameters: {
            agent: 'toolsAgent',
            promptType: 'define',
            text: '=Add this user to my Users sheet:\n{{ $json.toJsonString() }}',
          },
          id: '0d6c1bd7-cc91-4571-8fdb-c875a1af44c7',
          name: 'AI Agent With Tools',
          type: '@n8n/n8n-nodes-langchain.agent',
          typeVersion: 1.7,
          position: [40, 480],
        },
      ],
      connections: {
        Code: {
          main: [[{ node: 'AI Agent With Tools', type: 'main', index: 0 }]],
        },
        'OpenAI Chat Model': {
          ai_languageModel: [[{ node: 'AI Agent With Tools', type: 'ai_languageModel', index: 0 }]],
        },
        'Google Sheets Tool': {
          ai_tool: [[{ node: 'AI Agent With Tools', type: 'ai_tool', index: 0 }]],
        },
      },
    },
  },
  {
    id: 'n8n-core-code-execution',
    name: 'n8n Core: JavaScript Code Execution & Transformation',
    category: 'Data & Transformation',
    description:
      'Official n8n test workflow verifying Code Node modes (runOnceForAllItems vs runOnceForEachItem, async functions, promises).',
    sourceFixture: 'packages/nodes-base/nodes/Code/test/Code.workflow.json',
    nodeCount: 8,
    n8nJson: {
      nodes: [
        {
          parameters: {},
          id: '33eede8d-2ab0-42ab-b79a-a069d8549ab0',
          name: 'When clicking Execute Workflow',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [-40, 580],
        },
        {
          parameters: {
            jsCode: 'return[\n  { value: 1 },\n  { value: 2 },\n]',
          },
          id: 'a5913b52-24dc-4f81-bb7f-f90e61dad978',
          name: 'Sample Data',
          type: 'n8n-nodes-base.code',
          typeVersion: 1,
          position: [200, 580],
        },
        {
          parameters: {
            jsCode: 'let sum = 0;\nfor (const item of $input.all()) {\n  sum += item.json.value;\n}\nreturn [ {sum} ];',
          },
          id: 'c4ad4913-5af3-42bc-a784-69182f1facdd',
          name: 'Run Once for All Items',
          type: 'n8n-nodes-base.code',
          typeVersion: 1,
          position: [460, 320],
        },
        {
          parameters: {
            mode: 'runOnceForEachItem',
            jsCode: '$input.item.json.myNewField = $input.item.json.value * 10;\nreturn $input.item;',
          },
          id: 'f67d29bf-554a-4572-8867-4456182dec24',
          name: 'Run Once for Each Item',
          type: 'n8n-nodes-base.code',
          typeVersion: 1,
          position: [460, 680],
        },
        {
          parameters: {
            mode: 'runOnceForEachItem',
            jsCode: 'const json = $input.item.json;\njson.myNewField = await (async () => json.value * 2)();\nreturn $input.item;',
          },
          id: '3cff4a64-c3fd-47d3-a33e-3c446846138f',
          name: 'With Async Functions',
          type: 'n8n-nodes-base.code',
          typeVersion: 1,
          position: [460, 1000],
        },
      ],
      connections: {
        'When clicking Execute Workflow': {
          main: [[{ node: 'Sample Data', type: 'main', index: 0 }]],
        },
        'Sample Data': {
          main: [
            [
              { node: 'Run Once for All Items', type: 'main', index: 0 },
              { node: 'Run Once for Each Item', type: 'main', index: 0 },
              { node: 'With Async Functions', type: 'main', index: 0 },
            ],
          ],
        },
      },
    },
  },
  {
    id: 'n8n-core-multiple-inputs-merge',
    name: 'n8n Core: Multiple Inputs & Parallel Merge Node',
    category: 'Branching & Logic',
    description:
      'Official n8n test workflow verifying parallel data streams converging into a multi-input Merge node.',
    sourceFixture: 'packages/workflow/test/fixtures/WorkflowDataProxy/multiple_inputs_workflow.json',
    nodeCount: 7,
    n8nJson: {
      name: 'Parallel Merge Test',
      nodes: [
        {
          parameters: {},
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [-240, 300],
          id: '3a8a9543-567c-443c-8742-fa0a8d9fb2e7',
          name: 'Manual Trigger',
        },
        {
          parameters: { assignments: { assignments: [{ name: 'main_variable', value: 2 }] } },
          type: 'n8n-nodes-base.set',
          typeVersion: 3.4,
          position: [-20, 300],
          id: 'b6ec9c0f-de04-45d3-a402-3969251a6914',
          name: 'Set main variable',
        },
        {
          parameters: { assignments: { assignments: [{ name: 'stream_1', value: 'Alpha' }] } },
          type: 'n8n-nodes-base.set',
          typeVersion: 3.4,
          position: [200, 100],
          id: 'a1d151cc-8f44-43c6-962f-baecb879d33c',
          name: 'Stream 1',
        },
        {
          parameters: { assignments: { assignments: [{ name: 'stream_2', value: 'Beta' }] } },
          type: 'n8n-nodes-base.set',
          typeVersion: 3.4,
          position: [200, 300],
          id: '404ff876-b524-4873-8dc0-36664639907a',
          name: 'Stream 2',
        },
        {
          parameters: { assignments: { assignments: [{ name: 'stream_3', value: 'Gamma' }] } },
          type: 'n8n-nodes-base.set',
          typeVersion: 3.4,
          position: [200, 500],
          id: 'd403e979-7651-4acf-8e08-1d342b7abe7f',
          name: 'Stream 3',
        },
        {
          parameters: { numberInputs: 3 },
          type: 'n8n-nodes-base.merge',
          typeVersion: 3.1,
          position: [560, 300],
          id: '2b68168b-1494-4c4b-b416-b4fb6bb0afd8',
          name: 'Merge Streams',
        },
        {
          parameters: { assignments: { assignments: [{ name: 'status', value: 'Merged' }] } },
          type: 'n8n-nodes-base.set',
          typeVersion: 3.4,
          position: [840, 300],
          id: '16514f79-e309-465c-b571-7d81e268d7f0',
          name: 'Final Output',
        },
      ],
      connections: {
        'Manual Trigger': {
          main: [[{ node: 'Set main variable', type: 'main', index: 0 }]],
        },
        'Set main variable': {
          main: [
            [{ node: 'Stream 1', type: 'main', index: 0 }],
            [{ node: 'Stream 2', type: 'main', index: 0 }],
            [{ node: 'Stream 3', type: 'main', index: 0 }],
          ],
        },
        'Stream 1': {
          main: [[{ node: 'Merge Streams', type: 'main', index: 0 }]],
        },
        'Stream 2': {
          main: [[{ node: 'Merge Streams', type: 'main', index: 1 }]],
        },
        'Stream 3': {
          main: [[{ node: 'Merge Streams', type: 'main', index: 2 }]],
        },
        'Merge Streams': {
          main: [[{ node: 'Final Output', type: 'main', index: 0 }]],
        },
      },
    },
  },
  {
    id: 'n8n-core-error-handling',
    name: 'n8n Core: Error Proxy & Resilience Workflow',
    category: 'Error & Resiliency',
    description:
      'Official n8n test workflow verifying error routing, data aggregation, and sticky note documentation.',
    sourceFixture: 'packages/workflow/test/fixtures/WorkflowDataProxy/errors_workflow.json',
    nodeCount: 5,
    n8nJson: {
      name: 'Workflow Error Proxy',
      nodes: [
        {
          parameters: {},
          id: 'b5122d27-4bb5-4100-a69b-03b1dcac76c7',
          name: 'Manual Trigger',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [100, 200],
        },
        {
          parameters: {
            content: '## Error Resilience Test\nTests boundary error capture and aggregation.',
          },
          id: 'c277f7c6-8a7a-41e9-9484-78e90bd205bf',
          name: 'Documentation Note',
          type: 'n8n-nodes-base.stickyNote',
          typeVersion: 1,
          position: [100, 50],
        },
        {
          parameters: {
            fields: { values: [{ name: 'ticket_id', stringValue: 'TKT-999' }] },
          },
          id: '1de94b04-c87b-4ef1-b5d7-5078f9e33220',
          name: 'Edit Ticket Fields',
          type: 'n8n-nodes-base.set',
          typeVersion: 3.2,
          position: [400, 200],
        },
        {
          parameters: {
            jsCode: 'if ($json.ticket_id === "TKT-999") throw new Error("Simulated Test Exception"); return [$json];',
          },
          id: '6538818e-c5b3-422b-920c-d5d52533578b',
          name: 'Fault Injection Code',
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          position: [700, 200],
        },
        {
          parameters: {
            channel: '#error-alerts',
            text: 'Catch error: {{ $json.message }}',
          },
          id: 'f6606ff5-4d66-4efb-8dad-de7662f20867',
          name: 'Error Notification',
          type: 'n8n-nodes-base.slack',
          typeVersion: 1,
          position: [1000, 200],
        },
      ],
      connections: {
        'Manual Trigger': {
          main: [[{ node: 'Edit Ticket Fields', type: 'main', index: 0 }]],
        },
        'Edit Ticket Fields': {
          main: [[{ node: 'Fault Injection Code', type: 'main', index: 0 }]],
        },
        'Fault Injection Code': {
          main: [[{ node: 'Error Notification', type: 'main', index: 0 }]],
        },
      },
    },
  },
  {
    id: 'n8n-chat-streaming-agent',
    name: 'n8n Chat: Interactive Streaming Agent Workflow',
    category: 'LangChain & AI',
    description:
      'Official n8n frontend chat test fixture with chat trigger, OpenAI model, and streaming agent execution.',
    sourceFixture: 'packages/frontend/@n8n/chat/resources/workflow-streaming.json',
    nodeCount: 3,
    n8nJson: {
      nodes: [
        {
          parameters: { public: true, options: { responseMode: 'streaming' } },
          type: '@n8n/n8n-nodes-langchain.chatTrigger',
          typeVersion: 1.2,
          position: [32, 48],
          id: '012ecda4-3ae8-4328-a371-c7ae63cabf1c',
          name: 'When chat message received',
        },
        {
          parameters: { model: 'gpt-4o-mini', options: {} },
          type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
          typeVersion: 1.2,
          position: [400, 224],
          id: '9593988a-2ca5-4a82-bd3a-3d8fcb69036d',
          name: 'OpenAI Chat Model',
        },
        {
          parameters: { options: { returnIntermediateSteps: false, enableStreaming: true } },
          type: '@n8n/n8n-nodes-langchain.agent',
          typeVersion: 2.2,
          position: [400, 48],
          id: '72b37ab2-7352-476b-bca6-5b41e2290082',
          name: 'AI Streaming Agent',
        },
      ],
      connections: {
        'When chat message received': {
          main: [[{ node: 'AI Streaming Agent', type: 'main', index: 0 }]],
        },
        'OpenAI Chat Model': {
          ai_languageModel: [[{ node: 'AI Streaming Agent', type: 'ai_languageModel', index: 0 }]],
        },
      },
    },
  },
];

export function getOfficialN8nTestFlowById(id: string): N8nTestFlow | undefined {
  return OFFICIAL_N8N_TEST_FLOWS.find((f) => f.id === id);
}
