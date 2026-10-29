import { describe, it, expect, beforeEach } from 'vitest';
import { graphMemory } from '@/lib/copilot/graphMemory';
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow';

describe('GraphMemory Engine', () => {
  beforeEach(() => {
    graphMemory.clearMemory();
  });

  it('initializes with default seed nodes and topological edges', () => {
    const nodes = graphMemory.getAllNodes();
    const edges = graphMemory.getAllEdges();

    expect(nodes.length).toBeGreaterThanOrEqual(8);
    expect(edges.length).toBeGreaterThanOrEqual(9);

    const hasOfflineRule = nodes.some((n) => n.id === 'rule-offline-first');
    expect(hasOfflineRule).toBe(true);

    const hasHeuristicEngine = nodes.some((n) => n.id === 'engine-zero-cost-heuristic');
    expect(hasHeuristicEngine).toBe(true);

    const hasOllama = nodes.some((n) => n.id === 'engine-local-ollama');
    expect(hasOllama).toBe(true);
  });

  it('retrieves relevant subgraphs and formats context via queryGraph (GraphRAG)', () => {
    const result = graphMemory.queryGraph('Create a lead generation pipeline');

    expect(result.matchedNodeIds.length).toBeGreaterThan(0);
    expect(result.context).toContain('[SHARED GRAPH MEMORY CONTEXT]');
    expect(result.context).toContain('Lead Generation');
    expect(result.matchedNodeIds).toContain('wf-lead-generation');
  });

  it('retrieves offline rules when queried with offline keywords', () => {
    const result = graphMemory.queryGraph('Run offline without internet');

    expect(result.matchedNodeIds).toContain('rule-offline-first');
    expect(result.context).toContain('Offline-First Resilience');
  });

  it('matches known workflow templates for the Heuristic Engine', () => {
    const match = graphMemory.findMatchingTemplate('Need a lead generation workflow with Clearbit and ZeroBounce');

    expect(match).not.toBeNull();
    expect(match?.id).toBe('wf-lead-generation');
    expect(match?.label).toContain('Lead Generation');
  });

  it('records new workflows and expands the knowledge graph dynamically', () => {
    const initialCount = graphMemory.getNodeCount();

    const mockNodes: WorkflowNode[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          label: 'Invoice Webhook',
          flowType: 'webhook',
          type: 'webhook',
          category: 'triggers',
          icon: 'webhook',
          color: '#10b981',
          outputs: [{ id: 'output_0', label: 'Output', type: 'main' }],
          isConfigured: true,
          config: {},
        },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 400, y: 100 },
        data: {
          label: 'Stripe Invoice Payment',
          flowType: 'stripe',
          type: 'stripe',
          category: 'connectors',
          icon: 'credit-card',
          color: '#6366f1',
          outputs: [],
          isConfigured: true,
          config: {},
        },
      },
    ];

    const mockEdges: WorkflowEdge[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
      },
    ];

    graphMemory.recordInteraction(
      'Automated stripe invoice payment pipeline',
      'Created 2-node billing flow',
      mockNodes,
      mockEdges,
      'Stripe Invoice Pipeline'
    );

    expect(graphMemory.getNodeCount()).toBeGreaterThan(initialCount);

    const query = graphMemory.queryGraph('invoice stripe');
    expect(query.context).toContain('Stripe Invoice Pipeline');
  });
});
