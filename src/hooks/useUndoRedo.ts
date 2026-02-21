import { useEffect, useCallback, useRef } from 'react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useHistoryStore } from '@/stores/historyStore';

export function useUndoRedo() {
  const { nodes, edges, setNodes, setEdges } = useWorkflowStore();
  const { pushState, undo, redo, canUndo, canRedo, future, past } = useHistoryStore();
  const isUndoRedoing = useRef(false);
  const prevSnapshot = useRef<string>('');

  // Snapshot current state on meaningful changes
  useEffect(() => {
    if (isUndoRedoing.current) return;

    const snapshot = JSON.stringify({ n: nodes.map(n => ({ id: n.id, pos: n.position })), e: edges.map(e => e.id) });
    if (snapshot !== prevSnapshot.current && prevSnapshot.current !== '') {
      pushState({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      });
    }
    prevSnapshot.current = snapshot;
  }, [nodes, edges, pushState]);

  const handleUndo = useCallback(() => {
    if (!canUndo()) return;
    // Save current state to future
    const currentNodes = useWorkflowStore.getState().nodes;
    const currentEdges = useWorkflowStore.getState().edges;
    useHistoryStore.setState((s) => ({
      future: [...s.future, {
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
      }],
    }));
    
    const entry = undo();
    if (entry) {
      isUndoRedoing.current = true;
      setNodes(entry.nodes);
      setEdges(entry.edges);
      prevSnapshot.current = JSON.stringify({ n: entry.nodes.map(n => ({ id: n.id, pos: n.position })), e: entry.edges.map(e => e.id) });
      requestAnimationFrame(() => { isUndoRedoing.current = false; });
    }
  }, [canUndo, undo, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (!canRedo()) return;
    // Save current state to past
    const currentNodes = useWorkflowStore.getState().nodes;
    const currentEdges = useWorkflowStore.getState().edges;
    useHistoryStore.setState((s) => ({
      past: [...s.past, {
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
      }],
    }));

    const entry = redo();
    if (entry) {
      isUndoRedoing.current = true;
      setNodes(entry.nodes);
      setEdges(entry.edges);
      prevSnapshot.current = JSON.stringify({ n: entry.nodes.map(n => ({ id: n.id, pos: n.position })), e: entry.edges.map(e => e.id) });
      requestAnimationFrame(() => { isUndoRedoing.current = false; });
    }
  }, [canRedo, redo, setNodes, setEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo]);

  return {
    handleUndo,
    handleRedo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
