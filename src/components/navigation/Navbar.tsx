import { type FC, useRef, useState } from 'react';
import {
  Save,
  Play,
  Undo,
  Redo,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  ChevronLeft,
  MoreVertical,
  Download,
  Upload,
  FileJson,
  Share2,
  Copy,
  ExternalLink,
  LayoutGrid,
  History,
  Link2,
  Loader2,
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
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/stores/uiStore';
import { useWorkflowStore } from '@/lib/store';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  exportWorkflow,
  importWorkflow,
  downloadWorkflow,
  type ExportFormat,
} from '@/lib/workflow-io';
import ImportModal from '@/components/importer/ImportModal';

export interface NavbarProps {
  onSave?: () => void;
  onRun?: () => void;
  onOpenTemplates?: () => void;
  onOpenShare?: () => void;
  onOpenVersions?: () => void;
  workflowId?: string | null;
}

const Navbar: FC<NavbarProps> = ({
  onSave,
  onRun,
  onOpenTemplates,
  onOpenShare,
  onOpenVersions,
  workflowId,
}) => {
  const { isNodeLibraryOpen, toggleNodeLibrary, toggleAIAssistant, toggleSettings } =
    useUIStore();
  const {
    workflow,
    nodes,
    edges,
    updateWorkflowMeta,
    isDirty,
    setWorkflow,
    isRunning,
    runWorkflowSandboxed,
    isImportModalOpen,
    setImportModalOpen,
  } = useWorkflowStore();
  const { handleUndo, handleRedo, canUndo, canRedo } = useUndoRedo();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localImportOpen, setLocalImportOpen] = useState(false);

  const importModalOpen = isImportModalOpen || localImportOpen;
  const closeImportModal = () => {
    setImportModalOpen(false);
    setLocalImportOpen(false);
  };

  const handleExport = (format: ExportFormat) => {
    if (!workflow) return;

    const content = exportWorkflow(workflow, nodes, edges, format);
    const formatLabel = format === 'json' ? 'Shadow Flow' : format;
    const filename = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}-${format}.json`;

    downloadWorkflow(content, filename);

    toast({
      title: 'Workflow exported',
      description: `Exported as ${formatLabel} format`,
    });
  };

  const handleQuickFileImport = () => {
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
        missingCredentials: imported.missingCredentials,
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
        description:
          error instanceof Error ? error.message : 'Could not parse the workflow file',
      });
    }

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

  const handleExecute = async () => {
    if (nodes.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Canvas is empty',
        description: 'Add nodes or clone a template before running.',
      });
      return;
    }

    const summary = await runWorkflowSandboxed();
    if (summary.success) {
      toast({
        title: '⚡ Workflow Executed Successfully',
        description: `Completed in ${summary.totalDurationMs}ms across ${Object.keys(summary.nodeStates).length} nodes.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Execution Failed',
        description: summary.error || 'One or more nodes encountered an error.',
      });
    }

    if (onRun) {
      onRun();
    }
  };

  if (isMobile) {
    return (
      <>
        <div className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-3">
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

          <div className="flex-1 mx-2 min-w-0">
            <Input
              value={workflow?.name || 'Untitled Workflow'}
              onChange={(e) => updateWorkflowMeta({ name: e.target.value })}
              className="h-8 text-center bg-transparent border-none font-medium focus-visible:ring-1 text-sm"
            />
          </div>

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
                <DropdownMenuItem onClick={handleExecute}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Workflow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenTemplates}>
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  120+ Templates
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocalImportOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  n8n JSON Importer
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
        <ImportModal isOpen={importModalOpen} onClose={closeImportModal} />
      </>
    );
  }

  return (
    <>
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
            className="h-8 w-52 bg-transparent border-none font-medium focus-visible:ring-1"
          />

          {isDirty && (
            <span className="text-xs text-muted-foreground">Unsaved changes</span>
          )}
        </div>

        {/* Center section - History controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!canUndo}
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!canRedo}
            onClick={handleRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenTemplates}
            className="gap-1.5 text-xs h-8"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-primary" />
            120+ Templates
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocalImportOpen(true)}
            className="gap-1.5 text-xs h-8"
          >
            <Upload className="h-3.5 w-3.5 text-emerald-500" />
            Import n8n JSON
          </Button>

          {/* File Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
                <FileJson className="h-3.5 w-3.5" />
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Ecosystem</DropdownMenuLabel>
              <DropdownMenuItem onClick={onOpenTemplates}>
                <LayoutGrid className="h-4 w-4 mr-2" />
                Browse 120+ Templates...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocalImportOpen(true)}>
                <FileJson className="h-4 w-4 mr-2" />
                Universal n8n Importer...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleQuickFileImport}>
                <Upload className="h-4 w-4 mr-2" />
                Quick Import File (.json)...
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Export</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <Download className="h-4 w-4 mr-2" />
                Export as Shadow Flow (.json)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('n8n')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Export as n8n Workflow (.json)
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Share2 className="h-4 w-4 mr-2" />
                  Other Formats
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
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
                Copy JSON to clipboard
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Collaborate & History</DropdownMenuLabel>
              <DropdownMenuItem onClick={onOpenShare} disabled={!workflowId}>
                <Link2 className="h-4 w-4 mr-2" />
                Share Workflow...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenVersions} disabled={!workflowId}>
                <History className="h-4 w-4 mr-2" />
                Version History...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="secondary"
            size="sm"
            onClick={toggleAIAssistant}
            className="gap-1.5 h-8 text-xs border border-primary/30"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Copilot
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleExecute}
            disabled={isRunning}
            className="gap-1.5 h-8 text-xs border-emerald-500/40 hover:bg-emerald-500/10"
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
            ) : (
              <Play className="h-3.5 w-3.5 text-emerald-500" />
            )}
            {isRunning ? 'Running...' : 'Run'}
          </Button>

          <Button size="sm" onClick={onSave} className="gap-1.5 h-8 text-xs">
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </div>

      <ImportModal isOpen={importModalOpen} onClose={closeImportModal} />
    </>
  );
};

export default Navbar;
