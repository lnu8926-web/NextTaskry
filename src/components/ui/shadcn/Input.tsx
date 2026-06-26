import * as React from "react";

import { cn } from "@/lib/utils/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // layout
        "w-full min-w-0 rounded-lg border",
        // surface
        "bg-white dark:bg-input/30",
        // border — slate-200 is visibly distinct from white card bg
        "border-slate-200 dark:border-border",
        // spacing — slightly generous for clear click area
        "px-3.5 py-2.5 text-sm",
        // typography
        "text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground",
        // shadow — gives subtle depth against white card
        "shadow-sm",
        // transition
        "transition-[border-color,box-shadow] duration-150",
        // hover
        "hover:border-slate-300 hover:shadow-md",
        // focus — sky ring signals active input clearly
        "outline-none",
        "focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-100 dark:focus-visible:ring-sky-900/30",
        // states
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        // file input
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Input };
