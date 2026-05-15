import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  children?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-6 py-2.5 text-sm font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
        {
          "bg-nature-green text-white hover:bg-opacity-90 shadow-lg shadow-green-900/10": variant === "primary",
          "bg-soft-cream text-nature-green hover:opacity-80": variant === "secondary",
          "border border-sand bg-bg-card hover:bg-black/5 text-text-main": variant === "outline",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",
          "bg-transparent hover:bg-black/5 text-text-main": variant === "ghost",
        },
        className
      )}
      {...props}
    />
  );
}
