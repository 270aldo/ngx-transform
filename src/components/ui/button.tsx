import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neonBase = "shadow-[0_0_10px_rgba(109,0,255,0.6)]";
const ringViolet = "ring-1 ring-[#6D00FF]/60";
const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D00FF] disabled:opacity-50 disabled:pointer-events-none ${neonBase}`,
  {
    variants: {
      variant: {
        default: `bg-[#6D00FF] text-white hover:brightness-110 ${ringViolet}`,
        secondary: `bg-black text-white hover:bg-neutral-900 border border-[#6D00FF]/60 ${ringViolet}`,
        ghost: `bg-black/30 text-white hover:bg-neutral-900 border border-[#6D00FF]/40 ${ringViolet}`,
        outline: `border border-[#6D00FF] bg-transparent text-white hover:bg-neutral-900 ${ringViolet}`,
        destructive: "bg-red-500 text-white hover:bg-red-400",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  }
);
Button.displayName = "Button";
