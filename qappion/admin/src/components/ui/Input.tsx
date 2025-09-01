import { cn } from "@/lib/cn";
export default function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn("h-10 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200", className)} />;
}