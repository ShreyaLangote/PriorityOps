import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { mockTickets, LegacyTicket } from "@/data/mockTickets";
import { Ticket } from "@/types/api";
import { useTickets } from "@/hooks/useTickets";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Star, ArrowUp, RotateCw, List, Brain } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AISuggestionModal from "@/components/AISuggestionModal";

const Tickets = () => {
  const [selectedTicket, setSelectedTicket] = useState<LegacyTicket | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTicket, setAiTicket] = useState<LegacyTicket | null>(null);
  
  // Use real API data when available, fallback to mock data
  const { data: ticketsData, isLoading, error } = useTickets({
    page: 1,
    per_page: 50
  });
  
  // Convert API tickets to legacy format for display compatibility
  const displayTickets = ticketsData?.tickets?.map((ticket: Ticket): LegacyTicket => ({
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status === 'in_progress' ? 'in-progress' : 
            ticket.status === 'closed' ? 'resolved' : 
            ticket.status as "open" | "in-progress" | "pending" | "resolved" | "escalated",
    assignee: {
      name: ticket.assignee || 'Unassigned',
      avatar: ticket.assignee ? ticket.assignee.substring(0, 2).toUpperCase() : 'UN'
    },
    department: ticket.department || 'Unknown',
    createdAt: new Date(ticket.created_at).toLocaleString(),
    sla: '4h 30m', // TODO: Calculate actual SLA
    aiSuggestion: undefined
  })) || mockTickets;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-destructive border-destructive/30 bg-destructive/10";
      case "high":
        return "text-warning border-warning/30 bg-warning/10";
      case "medium":
        return "text-primary border-primary/30 bg-primary/10";
      default:
        return "text-muted-foreground border-muted bg-muted/10";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "text-warning bg-warning/20";
      case "resolved":
        return "text-success bg-success/20";
      case "escalated":
        return "text-destructive bg-destructive/20";
      case "pending":
        return "text-muted-foreground bg-muted/20";
      default:
        return "text-primary bg-primary/20";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 grid-pattern">
          {/* Header */}
          <div className="bg-card border border-primary/30 rounded-lg p-6 mb-6 glow-blue">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <List className="h-6 w-6 text-primary" />
                  <h1 className="text-3xl font-display font-bold">LIVE TICKET QUEUE</h1>
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  Real-time Monitoring • {mockTickets.length} Active
                </p>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
                <div className={`w-3 h-3 rounded-full animate-pulse ${error ? 'bg-destructive' : 'bg-success'}`} />
                <span className="text-sm font-medium">
                  {error ? 'API Disconnected' : isLoading ? 'Connecting...' : `${displayTickets.length} Loaded`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-48 bg-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-primary/30">
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="priority">
                <SelectTrigger className="w-48 bg-background border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-primary/30">
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="created">Created Time</SelectItem>
                  <SelectItem value="sla">SLA</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="ml-auto border-primary/30 hover:bg-primary/10 gap-2"
              >
                <RotateCw className="h-4 w-4" />
                REFRESH
              </Button>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-card border border-primary/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/10 border-b border-primary/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-display font-semibold uppercase tracking-wider">
                      SLA
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-display font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-primary font-semibold">
                              {ticket.id}
                            </span>
                          </div>
                          <p className="font-medium mb-1">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.department} • {ticket.createdAt}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority === "critical" && "⚠"}
                          {ticket.priority === "high" && "○"}
                          {ticket.priority === "medium" && "○"}
                          {ticket.priority === "low" && "—"}
                          <span className="uppercase">{ticket.priority}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status.replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                            {ticket.assignee.avatar}
                          </div>
                          <span className="text-sm font-medium">
                            {ticket.assignee.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono">{ticket.sla}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(ticket);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-lg w-fit">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs text-success font-medium">Connected • 75ms latency</span>
          </div>
        </main>
      </div>

      {aiTicket && (
        <AISuggestionModal
          isOpen={aiModalOpen}
          onClose={() => {
            setAiModalOpen(false);
            setAiTicket(null);
          }}
          ticket={aiTicket}
        />
      )}

      {/* Ticket Detail Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="bg-card border-primary/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <span className="text-primary">{selectedTicket?.id}</span>
            </DialogTitle>
            <DialogDescription>{selectedTicket?.title}</DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              <Button
                onClick={() => {
                  setAiTicket(selectedTicket);
                  setAiModalOpen(true);
                }}
                className="w-full bg-accent hover:bg-accent/90 text-black font-semibold"
              >
                <Brain className="h-4 w-4 mr-2" />
                Get AI Suggestion
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                      selectedTicket.priority
                    )}`}
                  >
                    {selectedTicket.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status.replace("-", " ")}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">SLA Timer</p>
                  <p className="text-sm font-mono">{selectedTicket.sla}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assignee</p>
                  <p className="text-sm font-medium">{selectedTicket.assignee.name}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Description</p>
                <p className="text-sm bg-background/50 p-4 rounded-lg border border-border">
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.aiSuggestion && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
                      <span className="text-xs">🤖</span>
                    </div>
                    <p className="text-sm font-semibold">AI-Generated Resolution Suggestion</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedTicket.aiSuggestion}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  Resolve Ticket
                </Button>
                <Button variant="outline" className="flex-1 border-primary/30">
                  Escalate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tickets;
