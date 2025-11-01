import { LayoutDashboard, Ticket, Brain, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Ticket, label: "Tickets", path: "/tickets" },
  { icon: Brain, label: "AI Insights", path: "/insights" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gradient-to-b from-card to-card/50 border-r border-primary/30">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium",
                "hover:bg-primary/10 hover:glow-blue",
                isActive
                  ? "bg-primary/20 text-primary border border-primary/30 glow-blue"
                  : "text-muted-foreground border border-transparent"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
