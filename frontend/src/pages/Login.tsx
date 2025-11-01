import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login - navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-pattern">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      
      <div className="relative w-full max-w-md p-8">
        <div className="bg-card border border-primary/30 rounded-lg p-8 glow-blue">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-primary p-3 rounded-lg glow-blue">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-display font-bold text-primary text-glow-blue">
                PriorityOps
              </h1>
              <p className="text-xs text-muted-foreground">AI-Powered IT Ticket Management</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-display font-semibold mb-2">
              Welcome to PriorityOps
            </h2>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Command Center Access
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@priorityops.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-primary/30 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-primary/30 focus:border-primary"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display font-semibold glow-blue transition-all"
            >
              ACCESS COMMAND CENTER
            </Button>
          </form>

          {/* Status */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">Systems Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
