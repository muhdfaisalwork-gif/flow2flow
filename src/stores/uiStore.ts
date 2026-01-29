import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // Editor UI
  selectedNodeId: string | null;
  isNodeLibraryOpen: boolean;
  isConfigPanelOpen: boolean;
  isAIAssistantOpen: boolean;
  
  // Zoom and viewport
  zoom: number;
  
  // Modals
  isCommandPaletteOpen: boolean;
  isSettingsOpen: boolean;
  
  // Actions
  selectNode: (nodeId: string | null) => void;
  toggleNodeLibrary: () => void;
  setNodeLibraryOpen: (open: boolean) => void;
  toggleConfigPanel: () => void;
  setConfigPanelOpen: (open: boolean) => void;
  toggleAIAssistant: () => void;
  setAIAssistantOpen: (open: boolean) => void;
  setZoom: (zoom: number) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleSettings: () => void;
  setSettingsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      selectedNodeId: null,
      isNodeLibraryOpen: true,
      isConfigPanelOpen: false,
      isAIAssistantOpen: false,
      zoom: 1,
      isCommandPaletteOpen: false,
      isSettingsOpen: false,

      selectNode: (nodeId) => set({ 
        selectedNodeId: nodeId,
        isConfigPanelOpen: nodeId !== null,
      }),

      toggleNodeLibrary: () => set((state) => ({ 
        isNodeLibraryOpen: !state.isNodeLibraryOpen 
      })),
      
      setNodeLibraryOpen: (open) => set({ isNodeLibraryOpen: open }),

      toggleConfigPanel: () => set((state) => ({ 
        isConfigPanelOpen: !state.isConfigPanelOpen 
      })),
      
      setConfigPanelOpen: (open) => set({ isConfigPanelOpen: open }),

      toggleAIAssistant: () => set((state) => ({ 
        isAIAssistantOpen: !state.isAIAssistantOpen 
      })),
      
      setAIAssistantOpen: (open) => set({ isAIAssistantOpen: open }),

      setZoom: (zoom) => set({ zoom }),

      toggleCommandPalette: () => set((state) => ({ 
        isCommandPaletteOpen: !state.isCommandPaletteOpen 
      })),
      
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

      toggleSettings: () => set((state) => ({ 
        isSettingsOpen: !state.isSettingsOpen 
      })),
      
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    }),
    { name: 'ui-store' }
  )
);
