import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = ({ className, size = "md" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <Loader2 
      className={cn("animate-spin", sizeClasses[size], className)} 
    />
  );
};

export const LoadingCard = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex items-center justify-center p-8 bg-card border border-primary/30 rounded-lg">
    <div className="flex flex-col items-center gap-2">
      <LoadingSpinner size="lg" className="text-primary" />
      <p className="text-sm text-muted-foreground">
        {children || "Loading..."}
      </p>
    </div>
  </div>
);

export const ErrorCard = ({ 
  error, 
  retry 
}: { 
  error: string; 
  retry?: () => void;
}) => (
  <div className="flex items-center justify-center p-8 bg-card border border-destructive/30 rounded-lg">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-destructive text-xl">⚠</span>
      </div>
      <div>
        <h3 className="font-semibold text-destructive mb-1">Connection Error</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        {retry && (
          <button 
            onClick={retry}
            className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);