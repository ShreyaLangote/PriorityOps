import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Settings as SettingsIcon, User, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 grid-pattern">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-display font-bold">SETTINGS</h1>
            </div>
            <p className="text-muted-foreground uppercase tracking-wider text-sm">
              System Configuration & Preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Settings */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-primary/30 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-display font-semibold">Account</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        defaultValue="Admin"
                        className="bg-background border-primary/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        defaultValue="User"
                        className="bg-background border-primary/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="admin@priorityops.com"
                      className="bg-background border-primary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      defaultValue="IT Manager"
                      disabled
                      className="bg-background border-primary/30"
                    />
                  </div>

                  <Button className="bg-primary hover:bg-primary/90">
                    Save Changes
                  </Button>
                </div>
              </div>

              <div className="bg-card border border-primary/30 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-display font-semibold">Notifications</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">Critical Alerts</p>
                      <p className="text-xs text-muted-foreground">
                        Receive notifications for critical system alerts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">New Ticket Assignments</p>
                      <p className="text-xs text-muted-foreground">
                        Get notified when tickets are assigned to you
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">SLA Warnings</p>
                      <p className="text-xs text-muted-foreground">
                        Alert when tickets are approaching SLA deadline
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">AI Insights</p>
                      <p className="text-xs text-muted-foreground">
                        Receive AI-generated recommendations and insights
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-destructive/30 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="h-5 w-5 text-destructive" />
                  <h2 className="text-xl font-display font-semibold text-destructive">
                    Security
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      className="bg-background border-primary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      className="bg-background border-primary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="bg-background border-primary/30"
                    />
                  </div>

                  <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                    Change Password
                  </Button>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="space-y-6">
              <div className="bg-card border border-primary/30 rounded-lg p-6">
                <h2 className="text-xl font-display font-semibold mb-6">SYSTEM STATUS</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success/10 border border-success/30 rounded-lg">
                    <span className="text-sm">Database</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-xs text-success font-medium">Online</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-success/10 border border-success/30 rounded-lg">
                    <span className="text-sm">API Gateway</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-xs text-success font-medium">Online</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-success/10 border border-success/30 rounded-lg">
                    <span className="text-sm">AI Engine</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-xs text-success font-medium">Online</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-warning/10 border border-warning/30 rounded-lg">
                    <span className="text-sm">Email Service</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                      <span className="text-xs text-warning font-medium">Degraded</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-primary/30 rounded-lg p-6">
                <h2 className="text-xl font-display font-semibold mb-6">THEME</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">
                        Command center optimized theme
                      </p>
                    </div>
                    <Switch defaultChecked disabled />
                  </div>

                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Current Theme: <strong className="text-primary">Neon Blue</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
