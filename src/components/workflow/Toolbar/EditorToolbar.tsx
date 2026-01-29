import { type FC, useRef } from 'react';
import { 
  Save, Play, Undo, Redo, Settings, 
  PanelLeftClose, PanelLeft, Sparkles,
  ChevronLeft, MoreVertical, Download, Upload,
  FileJson, Share2, Copy, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from '@/stores/uiStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { exportWorkflow, importWorkflow, downloadWorkflow, type ExportFormat } from '@/lib/workflow-io';

interface EditorToolbarProps {
  onSave?: () => void;
  onRun?: () => void;
}

const EditorToolbar: FC<EditorToolbarProps> = ({ onSave, onRun }) => {
  const { isNodeLibraryOpen, toggleNodeLibrary, toggleAIAssistant, toggleSettings } = useUIStore();
  const { workflow, nodes, edges, updateWorkflowMeta, isDirty, setWorkflow } = useWorkflowStore();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = (format: ExportFormat) => {
    if (!workflow) return;
    
    const content = exportWorkflow(workflow, nodes, edges, format);
    const formatLabel = format === 'json' ? 'Flow2Flow' : format;
    const filename = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}-${format}.json`;
    
    downloadWorkflow(content, filename);
    
    toast({
      title: 'Workflow exported',
      description: `Exported as ${formatLabel} format`,
    });
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = importWorkflow(text);
      
      setWorkflow({
        id: crypto.randomUUID(),
        name: imported.name,
        description: imported.description,
        nodes: imported.nodes,
        edges: imported.edges,
        settings: imported.settings,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: 'Workflow imported',
        description: `Imported "${imported.name}" from ${imported.sourceFormat} format`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Could not parse the workflow file',
      });
    }

    // Reset input
    e.target.value = '';
  };

  const handleCopyToClipboard = async () => {
    if (!workflow) return;
    
    const content = exportWorkflow(workflow, nodes, edges, 'json');
    await navigator.clipboard.writeText(content);
    
    toast({
      title: 'Copied to clipboard',
      description: 'Workflow JSON copied to clipboard',
    });
  };

  if (isMobile) {
    return (
      <div className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-3">
        {/* Left section - compact */}
        <div className="flex items-center gap-2">
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
        </div>

        {/* Center - workflow name */}
        <div className="flex-1 mx-2 min-w-0">
          <Input
            value={workflow?.name || 'Untitled Workflow'}
            onChange={(e) => updateWorkflowMeta({ name: e.target.value })}
            className="h-8 text-center bg-transparent border-none font-medium focus-visible:ring-1 text-sm"
          />
        </div>

        {/* Right - mobile menu */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAIAssistant}
            className="h-8 w-8"
          >
            <Sparkles className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRun}>
                <Play className="h-4 w-4 mr-2" />
                Run Workflow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Save {isDirty && '•'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

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
        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Import/Export Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <FileJson className="h-4 w-4" />
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Import</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import from file...
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-2" />
              Export as Flow2Flow (.json)
            </DropdownMenuItem>
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Share2 className="h-4 w-4 mr-2" />
                Export for other platforms
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleExport('n8n')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  n8n format
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('activepieces')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Activepieces format
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('zapier')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Zapier format
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy to clipboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
