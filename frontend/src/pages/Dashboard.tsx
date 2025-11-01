import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import KPICard from "@/components/KPICard";
import { Activity, Clock, Target, Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { mockTickets } from "@/data/mockTickets";
import { useTicketSummary, usePerformanceMetrics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  // Use real API data when available
  const { data: summaryData } = useTicketSummary();
  const { data: performanceData } = usePerformanceMetrics();
  
  // Fallback to mock data if API is not available
  const activeTickets = summaryData?.open_tickets ?? mockTickets.filter(t => t.status !== "resolved").length;
  const resolvedToday = summaryData?.closed_tickets ?? mockTickets.filter(t => t.status === "resolved").length;
  const slaCompliance = performanceData?.resolution_rate_percent ?? 88.9;
  const avgResolution = performanceData?.avg_resolution_time_hours ?? 3.4;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 grid-pattern">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <h1 className="text-4xl font-display font-bold text-primary text-glow-blue">
                PRIORITY OPS
              </h1>
            </div>
            <p className="text-muted-foreground uppercase tracking-wider text-sm ml-3">
              Command Center Online • Systems Nominal
            </p>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-4 mb-6">
            <Select defaultValue="24h">
              <SelectTrigger className="w-48 bg-card border-primary/30">
                <SelectValue placeholder="Last 24 Hours" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-primary/30">
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-48 bg-card border-primary/30">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-primary/30">
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="it">IT Support</SelectItem>
                <SelectItem value="network">Network Ops</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Critical
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-warning/30 text-warning hover:bg-warning/10"
              >
                High
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/30 hover:bg-primary/10"
              >
                Medium
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-muted hover:bg-muted/10"
              >
                Low
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Active Tickets"
              value={activeTickets}
              subtitle="Currently open"
              icon={Activity}
              color="blue"
              trend={{ value: "12%", positive: false }}
              sparkline={[30, 40, 35, 50, 49, 60, 70, 91, 85, 70, 65, 55]}
            />
            <KPICard
              title="Avg Resolution Time"
              value={`${avgResolution} hrs`}
              subtitle="Last 24 hours"
              icon={Clock}
              color="green"
              trend={{ value: "8.2%", positive: true }}
              sparkline={[60, 55, 50, 45, 40, 38, 35, 33, 30, 28, 25, 23]}
            />
            <KPICard
              title="SLA Compliance"
              value={`${slaCompliance}%`}
              subtitle="Meeting targets"
              icon={Target}
              color="orange"
              trend={{ value: "2.1%", positive: false }}
              sparkline={[85, 87, 86, 88, 90, 89, 88, 87, 89, 90, 88, 89]}
            />
            <KPICard
              title="AI Classification Accuracy"
              value="82.9%"
              subtitle="Auto-routing success"
              icon={Brain}
              color="cyan"
              trend={{ value: "5.7%", positive: true }}
              sparkline={[70, 72, 75, 76, 78, 79, 80, 81, 82, 83, 82, 83]}
            />
          </div>

          {/* Recent Activity & Critical Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Tickets */}
            <div className="lg:col-span-2 bg-card border border-primary/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Recent Activity
                </h2>
                <Button variant="outline" size="sm" className="border-primary/30">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {mockTickets.slice(0, 5).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center gap-4 p-4 bg-background/50 border border-border rounded-lg hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className={`w-2 h-16 rounded-full ${
                      ticket.priority === "critical" ? "bg-destructive glow-red" :
                      ticket.priority === "high" ? "bg-warning glow-orange" :
                      ticket.priority === "medium" ? "bg-primary" :
                      "bg-muted"
                    }`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {ticket.id}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          {ticket.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-medium mb-1">{ticket.title}</h3>
                      <p className="text-xs text-muted-foreground">{ticket.department} • {ticket.createdAt}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">SLA</p>
                        <p className="text-sm font-medium">{ticket.sla}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {ticket.assignee.avatar}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Alerts Panel */}
            <div className="bg-card border border-destructive/30 rounded-lg p-6 glow-red">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h2 className="text-xl font-display font-semibold text-destructive">
                  Active Alerts
                </h2>
                <span className="ml-auto bg-destructive/20 text-destructive px-2 py-1 rounded-full text-xs font-bold">
                  3
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse mt-1.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-destructive mb-1">Database Connection Timeout</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Primary database cluster experiencing connection timeouts
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-mono">DB-PROD-01</span>
                        <span className="text-xs text-muted-foreground">2 min ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-2 h-2 bg-warning rounded-full animate-pulse mt-1.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-warning mb-1">High Memory Usage</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Application server memory usage above 85%
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-mono">APP-SRV-03</span>
                        <span className="text-xs text-muted-foreground">5 min ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse mt-1.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-destructive mb-1">Service Unavailable</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Authentication service returning 503 errors
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-mono">AUTH-SVC</span>
                        <span className="text-xs text-muted-foreground">8 min ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  Acknowledge All
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
