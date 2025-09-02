import * as React from "react";
import { cn } from "@/lib/cn";

export interface StatsRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const StatsRow = React.forwardRef<HTMLDivElement, StatsRowProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

StatsRow.displayName = "StatsRow";

export { StatsRow };
