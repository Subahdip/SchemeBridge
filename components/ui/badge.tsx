import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-aurora-600 text-white shadow hover:bg-aurora-700",
        secondary:
          "border border-navy-700 bg-navy-800 text-slate-300 hover:bg-navy-700",
        destructive:
          "border border-destructive bg-destructive/20 text-destructive shadow hover:bg-destructive/30",
        error:
          "border border-destructive bg-destructive/20 text-destructive shadow",
        outline: "border border-navy-700 text-foreground",
        success:
          "border border-teal-700 bg-teal-900/50 text-teal-400 shadow-sm",
        eligible:
          "border border-teal-700 bg-teal-900/50 text-teal-400 shadow-sm",
        info:
          "border border-aurora-700 bg-aurora-900/50 text-aurora-400 shadow-sm",
        active:
          "border border-aurora-700 bg-aurora-900/50 text-aurora-400 shadow-sm",
        glow: "border border-aurora-500/40 bg-aurora-500/15 text-aurora-300 shadow-[0_0_12px_rgba(99,102,241,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
