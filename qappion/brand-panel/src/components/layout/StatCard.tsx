import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
}

export function StatCard({ title, value, icon: Icon, trend, description }: StatCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
        <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center">
          <Icon className="h-6 w-6 text-brand-600" />
        </div>
      </div>
      {trend && (
        <div className="mt-4">
          <div className={`flex items-center text-sm ${
            trend.isPositive ? 'text-emerald-600' : 'text-red-600'
          }`}>
            <span className="font-medium">{trend.value}</span>
          </div>
        </div>
      )}
    </div>
  );
}
