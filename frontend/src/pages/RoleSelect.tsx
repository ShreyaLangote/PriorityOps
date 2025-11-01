import { User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid-pattern flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-display font-bold text-accent mb-4 text-glow-blue">
            PRIORITYOPS
          </h1>
          <p className="text-muted-foreground uppercase tracking-wider text-sm">
            Select Your Access Level
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* End User Portal */}
          <div
            onClick={() => navigate('/user-portal')}
            className="group cursor-pointer bg-card border border-primary/30 rounded-lg p-8 hover:scale-105 transition-all hover:glow-blue"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-6 rounded-full bg-primary/20 border border-primary/30 group-hover:glow-blue">
                <User className="h-16 w-16 text-primary" />
              </div>
              
              <div>
                <h2 className="text-2xl font-display font-bold mb-2">End User</h2>
                <p className="text-muted-foreground text-sm">
                  Submit IT support requests and track your tickets
                </p>
              </div>

              <Button 
                className="w-full bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary"
              >
                Access Support Portal
              </Button>
            </div>
          </div>

          {/* IT Agent Dashboard */}
          <div
            onClick={() => navigate('/dashboard')}
            className="group cursor-pointer bg-card border border-accent/30 rounded-lg p-8 hover:scale-105 transition-all glow-cyan"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-6 rounded-full bg-accent/20 border border-accent/30 group-hover:glow-cyan">
                <Shield className="h-16 w-16 text-accent" />
              </div>
              
              <div>
                <h2 className="text-2xl font-display font-bold mb-2">IT Agent</h2>
                <p className="text-muted-foreground text-sm">
                  Manage tickets, AI insights, and operations dashboard
                </p>
              </div>

              <Button 
                className="w-full bg-accent/20 border border-accent/30 hover:bg-accent/30 text-accent"
              >
                Access Command Center
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 text-xs text-muted-foreground">
          <p>Powered by AWS AI & Agentic Intelligence</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
