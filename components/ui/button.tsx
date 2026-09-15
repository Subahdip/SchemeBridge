import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] transition-all duration-150",
  {
    variants: {
      variant: {
        default:
          "bg-aurora-600 hover:bg-aurora-700 text-white shadow-md shadow-aurora-500/20",
        secondary:
          "bg-navy-800 border border-navy-700 hover:bg-navy-700 text-white shadow-sm",
        accent:
          "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20",
        cta:
          "bg-gradient-to-r from-aurora-600 to-sunset-500 hover:from-aurora-700 hover:to-sunset-600 text-white font-bold shadow-lg shadow-aurora-500/25 animate-glow",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-navy-700 bg-navy-900/60 shadow-sm hover:bg-navy-800 hover:text-white text-slate-200",
        ghost:
          "hover:bg-navy-800 hover:text-white text-slate-300",
        link:
          "text-aurora-400 underline-offset-4 hover:underline hover:text-aurora-300",
        gradient:
          "bg-gradient-to-r from-aurora-600 via-purple-600 to-teal-500 text-white shadow-lg shadow-aurora-500/25 hover:opacity-95 hover:shadow-aurora-500/40",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
