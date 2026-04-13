import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DemoBanner() {
  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-center gap-3 text-sm">
      <AlertTriangle className="w-4 h-4 text-primary" />
      <span className="text-muted-foreground">
        You're in <strong className="text-foreground">demo mode</strong> — changes won't be saved.
      </span>
      <Link to="/signup">
        <Button size="sm" variant="default" className="h-7 text-xs">
          Sign Up to Save
        </Button>
      </Link>
    </div>
  );
}
