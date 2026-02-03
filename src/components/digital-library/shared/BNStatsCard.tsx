import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface BNStatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "blue" | "gold" | "green" | "purple";
  className?: string;
}

export function BNStatsCard({
  label,
  value,
  icon,
  trend,
  variant = "blue",
  className,
}: BNStatsCardProps) {
  const variantStyles = {
    blue: {
      bg: "from-bn-blue-primary/10 to-bn-blue-primary/5",
      icon: "bg-bn-blue-primary/20 text-bn-blue-primary",
      border: "border-bn-blue-primary/20 hover:border-bn-blue-primary/40",
    },
    gold: {
      bg: "from-gold-bn-primary/10 to-gold-bn-primary/5",
      icon: "bg-gold-bn-primary/20 text-gold-bn-primary",
      border: "border-gold-bn-primary/20 hover:border-gold-bn-primary/40",
    },
    green: {
      bg: "from-emerald-500/10 to-emerald-500/5",
      icon: "bg-emerald-500/20 text-emerald-600",
      border: "border-emerald-500/20 hover:border-emerald-500/40",
    },
    purple: {
      bg: "from-purple-500/10 to-purple-500/5",
      icon: "bg-purple-500/20 text-purple-600",
      border: "border-purple-500/20 hover:border-purple-500/40",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300 hover:shadow-lg",
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-emerald-600" : "text-red-500"
            )}>
            <Icon 
              icon={trend.isPositive ? "mdi:trending-up" : "mdi:trending-down"} 
              className="w-3 h-3" 
            />
              <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", styles.icon)}>
          <Icon icon={icon} className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
