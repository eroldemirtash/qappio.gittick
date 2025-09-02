import * as React from "react";
import { cn } from "@/lib/cn";

export interface SimpleTableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

const SimpleTable = React.forwardRef<HTMLTableElement, SimpleTableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table
            ref={ref}
            className={cn("w-full", className)}
            {...props}
          >
            {children}
          </table>
        </div>
      </div>
    );
  }
);

SimpleTable.displayName = "SimpleTable";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-slate-50", className)}
    {...props}
  />
));

TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-slate-200", className)}
    {...props}
  />
));

TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("hover:bg-slate-50", className)}
    {...props}
  />
));

TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider",
      className
    )}
    {...props}
  />
));

TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-6 py-4 whitespace-nowrap text-sm text-slate-900", className)}
    {...props}
  />
));

TableCell.displayName = "TableCell";

export {
  SimpleTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
};
