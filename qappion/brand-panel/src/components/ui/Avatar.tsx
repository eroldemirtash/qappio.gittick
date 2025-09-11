import * as React from "react";
import { cn } from "@/lib/cn";
import { User } from "lucide-react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false);
    const normalizedSrc = React.useMemo(() => {
      if (!src) return undefined;
      try {
        // Trim spaces
        const trimmed = src.trim();
        if (trimmed.startsWith("//")) return `https:${trimmed}`;
        if (trimmed.startsWith("http://")) return trimmed.replace(/^http:\/\//, "https://");
        if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
        return trimmed;
      } catch {
        return src;
      }
    }, [src]);
    
    const sizes = {
      sm: "h-8 w-8",
      md: "h-10 w-10", 
      lg: "h-16 w-16"
    };

    const textSizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-slate-100",
          sizes[size],
          className
        )}
        {...props}
      >
        {normalizedSrc && !imgError ? (
          <img
            src={normalizedSrc}
            alt={alt}
            className="aspect-square h-full w-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            {fallback ? (
              <span className={cn("font-medium text-slate-600", textSizes[size])}>
                {fallback}
              </span>
            ) : (
              <User className={cn("text-slate-400", size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5")} />
            )}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
