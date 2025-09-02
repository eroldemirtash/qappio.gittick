import * as React from "react";
import { cn } from "@/lib/cn";
import { LucideIcon } from "lucide-react";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, icon: Icon, trend, description, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("card p-6", className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {trend && (
              <p className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              )}>
                {trend.isPositive ? "↗" : "↘"} {trend.value}
              </p>
            )}
            {description && (
              <p className="text-xs text-slate-500">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-brand-50 p-3">
              <Icon className="h-6 w-6 text-brand-600" />
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };
