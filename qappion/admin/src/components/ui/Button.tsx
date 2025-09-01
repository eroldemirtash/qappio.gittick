import { cn } from "@/lib/cn";
export default function Button({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={cn("px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50", className)} />;
}