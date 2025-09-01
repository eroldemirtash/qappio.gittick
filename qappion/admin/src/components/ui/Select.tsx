import { cn } from "@/lib/cn";
export default function Select({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={cn("h-10 px-3 rounded-xl border border-slate-200 bg-white", className)} />;
}