import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: "blue" | "green" | "orange" | "cyan";
  sparkline?: number[];
}

const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
  sparkline,
}: KPICardProps) => {
  const colorClasses = {
    blue: "bg-primary/20 border-primary/30 glow-blue",
    green: "bg-success/20 border-success/30",
    orange: "bg-warning/20 border-warning/30",
    cyan: "bg-accent/20 border-accent/30 glow-cyan",
  };

  const iconColorClasses = {
    blue: "bg-primary text-primary-foreground",
    green: "bg-success text-white",
    orange: "bg-warning text-black",
    cyan: "bg-accent text-black",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-6 transition-all hover:scale-105",
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-lg", iconColorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div
            className={cn(
              "text-sm font-medium flex items-center gap-1",
              trend.positive ? "text-success" : "text-destructive"
            )}
          >
            {trend.positive ? "▲" : "▼"} {trend.value}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-display font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {sparkline && (
        <div className="mt-4 h-12 flex items-end gap-1">
          {sparkline.map((val, idx) => (
            <div
              key={idx}
              className="flex-1 bg-primary/30 rounded-t"
              style={{ height: `${val}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default KPICard;
