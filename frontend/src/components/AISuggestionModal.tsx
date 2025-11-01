import { useState } from "react";
import { Brain, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    id: string;
    title: string;
    description: string;
  };
}

const AISuggestionModal = ({ isOpen, onClose, ticket }: AISuggestionModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    suggestion: string;
    confidence: number;
    category: string;
  } | null>(null);

  const fetchSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);

    try {
      const response = await api.getAISuggestion(ticket.id, ticket.description);
      setSuggestion(response);
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to generate suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (open: boolean) => {
    if (open && !suggestion && !isLoading) {
      fetchSuggestion();
    }
    if (!open) {
      onClose();
      setSuggestion(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl bg-card border-accent/30 glow-cyan">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-display">
            <Brain className="h-6 w-6 text-accent" />
            AI Resolution Assistant
          </DialogTitle>
          <DialogDescription>
            Neural network analysis for ticket {ticket.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="bg-background/50 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
          </div>

          {/* AI Thinking Animation */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 text-accent animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse">
                AI analyzing ticket patterns...
              </p>
            </div>
          )}

          {/* AI Suggestion */}
          {suggestion && !isLoading && (
            <div className="space-y-4 animate-fade-in">
              {/* Confidence Score */}
              <div className="bg-background/50 border border-accent/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    Confidence Score
                  </span>
                  <span className="text-lg font-display font-bold text-accent">
                    {suggestion.confidence}%
                  </span>
                </div>
                <Progress value={suggestion.confidence} className="h-2" />
              </div>

              {/* Category */}
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Category: <span className="text-foreground font-medium">{suggestion.category}</span>
                </span>
              </div>

              {/* Suggestion Text */}
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-6">
                <h4 className="text-sm font-semibold text-accent mb-3 uppercase tracking-wider">
                  Recommended Resolution
                </h4>
                <p className="text-sm leading-relaxed">{suggestion.suggestion}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    toast({
                      title: "Solution Applied",
                      description: "AI suggestion has been added to ticket notes.",
                    });
                    onClose();
                  }}
                  className="flex-1 bg-accent hover:bg-accent/90 text-black font-semibold"
                >
                  Apply Suggestion
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Ticket Escalated",
                      description: "Ticket has been escalated to senior support.",
                    });
                    onClose();
                  }}
                  variant="outline"
                  className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  Escalate to Human
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISuggestionModal;
