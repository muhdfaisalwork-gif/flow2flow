import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DemoVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoVideoModal({ open, onOpenChange }: DemoVideoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 border-border">
        <video
          src="/demo-video.mp4"
          autoPlay
          controls
          className="w-full rounded-lg"
          onEnded={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
