import { type FC } from 'react';
import { 
  Save, Play, Undo, Redo, Settings, 
  PanelLeftClose, PanelLeft, Sparkles,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/uiStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { Link } from 'react-router-dom';

interface EditorToolbarProps {
  onSave?: () => void;
  onRun?: () => void;
}

const EditorToolbar: FC<EditorToolbarProps> = ({ onSave, onRun }) => {
  const { isNodeLibraryOpen, toggleNodeLibrary, toggleAIAssistant, toggleSettings } = useUIStore();
  const { workflow, updateWorkflowMeta, isDirty } = useWorkflowStore();

  return (
    <div className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleNodeLibrary}
          className="h-8 w-8"
        >
          {isNodeLibraryOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Input
          value={workflow?.name || 'Untitled Workflow'}
          onChange={(e) => updateWorkflowMeta({ name: e.target.value })}
          className="h-8 w-48 bg-transparent border-none font-medium focus-visible:ring-1"
        />

        {isDirty && (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        )}
      </div>

      {/* Center section - History controls */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAIAssistant}
          className="gap-1.5"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSettings}
          className="h-8 w-8"
        >
          <Settings className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant="outline"
          size="sm"
          onClick={onRun}
          className="gap-1.5"
        >
          <Play className="h-4 w-4" />
          Run
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          className="gap-1.5"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default EditorToolbar;
