import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow';

interface HistoryEntry {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxHistory: number;

  pushState: (entry: HistoryEntry) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  devtools(
    (set, get) => ({
      past: [],
      future: [],
      maxHistory: 50,

      pushState: (entry) => {
        set((state) => ({
          past: [...state.past.slice(-(state.maxHistory - 1)), entry],
          future: [], // clear redo stack on new action
        }));
      },

      undo: () => {
        const { past } = get();
        if (past.length === 0) return null;
        const previous = past[past.length - 1];
        set((state) => ({
          past: state.past.slice(0, -1),
          // current state will be pushed to future by the caller
        }));
        return previous;
      },

      redo: () => {
        const { future } = get();
        if (future.length === 0) return null;
        const next = future[future.length - 1];
        set((state) => ({
          future: state.future.slice(0, -1),
          // current state will be pushed to past by the caller
        }));
        return next;
      },

      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,

      clear: () => set({ past: [], future: [] }),
    }),
    { name: 'history-store' }
  )
);
