import * as React from "react";
import { cn } from "@/lib/cn";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between", className)}
        {...props}
      >
        <div className="space-y-1">
          <h1 className="page-title text-slate-900">{title}</h1>
          {description && (
            <p className="text-slate-600">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-3">
            {action}
          </div>
        )}
      </div>
    );
  }
);

PageHeader.displayName = "PageHeader";

export { PageHeader };
