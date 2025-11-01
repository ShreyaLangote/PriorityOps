import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Brain, TrendingUp, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Insights = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 grid-pattern">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8 text-accent" />
              <h1 className="text-4xl font-display font-bold text-accent text-glow-blue">
                REAL-TIME TICKET FLOW
              </h1>
            </div>
            <p className="text-muted-foreground uppercase tracking-wider text-sm">
              Neural Network Analysis • Predictive Insights
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              className="border-primary/30 bg-primary/20 text-primary gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              FLOW
            </Button>
            <Button
              variant="outline"
              className="border-primary/30 gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              CATEGORIES
            </Button>
            <Button
              variant="outline"
              className="border-primary/30 gap-2 ml-auto"
            >
              <Download className="h-4 w-4" />
              EXPORT
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 border border-success/30">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-success">LIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-card border border-primary/30 rounded-lg p-6 glow-blue">
              <div className="mb-6">
                <h2 className="text-xl font-display font-semibold mb-1">
                  Neural Network Analysis • Predictive Insights
                </h2>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Time-based ticket volume trends
                </p>
              </div>

              {/* Mock Chart */}
              <div className="relative h-80 bg-background/50 rounded-lg border border-border p-6">
                <svg viewBox="0 0 1000 300" className="w-full h-full">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 75}
                      x2="1000"
                      y2={i * 75}
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  ))}

                  {/* Submitted Line */}
                  <path
                    d="M 0 200 L 83 180 L 167 190 L 250 170 L 333 130 L 417 100 L 500 80 L 583 120 L 667 190 L 750 230 L 833 250 L 917 270 L 1000 280"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                  />

                  {/* Resolved Line */}
                  <path
                    d="M 0 250 L 83 240 L 167 250 L 250 230 L 333 210 L 417 190 L 500 170 L 583 160 L 667 150 L 750 180 L 833 200 L 917 210 L 1000 220"
                    fill="none"
                    stroke="hsl(var(--success))"
                    strokeWidth="3"
                  />

                  {/* In Progress Line */}
                  <path
                    d="M 0 190 L 83 200 L 167 210 L 250 230 L 333 200 L 417 180 L 500 120 L 583 90 L 667 60 L 750 100 L 833 150 L 917 180 L 1000 200"
                    fill="none"
                    stroke="hsl(var(--warning))"
                    strokeWidth="3"
                  />

                  {/* Data point at 14:00 */}
                  <circle cx="500" cy="80" r="6" fill="hsl(var(--primary))" />
                  <circle cx="500" cy="170" r="6" fill="hsl(var(--success))" />
                  <circle cx="500" cy="120" r="6" fill="hsl(var(--warning))" />
                </svg>

                {/* Tooltip */}
                <div className="absolute top-1/4 left-1/2 bg-card border border-primary/30 rounded-lg p-4 glow-blue">
                  <p className="text-xs text-muted-foreground mb-2">14:00</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm">Submitted: <strong>45</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span className="text-sm">Resolved: <strong>32</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <span className="text-sm">InProgress: <strong>64</strong></span>
                    </div>
                  </div>
                </div>

                {/* Time labels */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-between px-6 text-xs text-muted-foreground">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">SUBMITTED</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground">RESOLVED</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-warning" />
                  <span className="text-sm text-muted-foreground">IN PROGRESS</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-card border border-primary/30 rounded-lg p-6">
                <h2 className="text-xl font-display font-semibold mb-6">QUICK STATS</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Tickets Today
                      </span>
                      <span className="text-2xl font-display font-bold">23</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Resolved Today
                      </span>
                      <span className="text-2xl font-display font-bold text-success">18</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Escalated
                      </span>
                      <span className="text-2xl font-display font-bold text-destructive">3</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Avg Response
                      </span>
                      <span className="text-2xl font-display font-bold text-primary">18m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Performance */}
              <div className="bg-card border border-primary/30 rounded-lg p-6">
                <h2 className="text-xl font-display font-semibold mb-6">TEAM PERFORMANCE</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Level 1 Support
                      </span>
                      <span className="text-sm font-bold">67%</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: '67%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Level 2 Support
                      </span>
                      <span className="text-sm font-bold">45%</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-lg w-fit">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs text-success font-medium">Connected • 65ms latency</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Insights;
