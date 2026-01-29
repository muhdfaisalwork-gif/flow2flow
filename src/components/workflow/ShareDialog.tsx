import { type FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Link, Globe, Lock, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string | null;
  workflowName: string;
  currentShareToken: string | null;
  isPublic: boolean;
  onUpdate: (shareToken: string | null, isPublic: boolean) => void;
}

const ShareDialog: FC<ShareDialogProps> = ({ 
  isOpen, 
  onClose, 
  workflowId,
  workflowName,
  currentShareToken,
  isPublic,
  onUpdate 
}) => {
  const [shareToken, setShareToken] = useState(currentShareToken);
  const [isPublicState, setIsPublicState] = useState(isPublic);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = shareToken 
    ? `${window.location.origin}/workflow/share/${shareToken}`
    : null;

  const generateShareLink = async () => {
    if (!workflowId) {
      toast({
        variant: 'destructive',
        title: 'Save first',
        description: 'Please save your workflow before sharing',
      });
      return;
    }

    setIsLoading(true);
    const newToken = crypto.randomUUID();
    
    const { error } = await supabase
      .from('workflows')
      .update({ share_token: newToken })
      .eq('id', workflowId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating share link',
        description: error.message,
      });
    } else {
      setShareToken(newToken);
      onUpdate(newToken, isPublicState);
      toast({
        title: 'Share link created',
        description: 'Anyone with the link can now import this workflow',
      });
    }
    setIsLoading(false);
  };

  const revokeShareLink = async () => {
    if (!workflowId) return;
    
    setIsLoading(true);
    const { error } = await supabase
      .from('workflows')
      .update({ share_token: null })
      .eq('id', workflowId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error revoking link',
        description: error.message,
      });
    } else {
      setShareToken(null);
      onUpdate(null, isPublicState);
      toast({
        title: 'Share link revoked',
        description: 'The previous link will no longer work',
      });
    }
    setIsLoading(false);
  };

  const togglePublic = async () => {
    if (!workflowId) return;
    
    setIsLoading(true);
    const newPublicState = !isPublicState;
    
    const { error } = await supabase
      .from('workflows')
      .update({ is_public: newPublicState })
      .eq('id', workflowId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error updating visibility',
        description: error.message,
      });
    } else {
      setIsPublicState(newPublicState);
      onUpdate(shareToken, newPublicState);
      toast({
        title: newPublicState ? 'Workflow is now public' : 'Workflow is now private',
        description: newPublicState 
          ? 'This workflow will appear in the public gallery' 
          : 'Only you can see this workflow',
      });
    }
    setIsLoading(false);
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Link copied',
      description: 'Share link copied to clipboard',
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Share Workflow</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {workflowName}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Public Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                {isPublicState ? (
                  <Globe className="h-5 w-5 text-green-500" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label className="font-medium">Public Workflow</Label>
                  <p className="text-xs text-muted-foreground">
                    {isPublicState ? 'Visible in template gallery' : 'Only visible to you'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={isPublicState} 
                onCheckedChange={togglePublic}
                disabled={isLoading || !workflowId}
              />
            </div>

            {/* Share Link */}
            <div className="space-y-3">
              <Label>Share Link</Label>
              
              {shareUrl ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      value={shareUrl} 
                      readOnly 
                      className="text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={revokeShareLink}
                      disabled={isLoading}
                    >
                      Revoke Link
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(shareUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={generateShareLink}
                  disabled={isLoading || !workflowId}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Generate Share Link
                </Button>
              )}
              
              <p className="text-xs text-muted-foreground">
                Anyone with the link can import a copy of this workflow
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareDialog;
