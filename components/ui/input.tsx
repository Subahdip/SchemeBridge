import * as React from "react";

import { cn } from "@/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-navy-700 bg-navy-800 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-aurora-500 focus:ring-1 focus:ring-aurora-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
