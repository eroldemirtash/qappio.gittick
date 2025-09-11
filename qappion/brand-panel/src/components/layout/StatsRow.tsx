import { ReactNode } from "react";

interface StatsRowProps {
  children: ReactNode;
}

export function StatsRow({ children }: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      {children}
    </div>
  );
}
