import * as React from "react";

import { cn } from "@/lib/utils/utils";

function Textarea({ className, onChange, ...props }: React.ComponentProps<"textarea">) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  React.useEffect(() => {
    if (ref.current) autoResize(ref.current);
  }, [props.value, props.defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    autoResize(e.target);
    onChange?.(e);
  };

  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        // layout
        "flex min-h-20 w-full rounded-lg border resize-none overflow-hidden",
        // surface
        "bg-white dark:bg-input/30",
        // border
        "border-slate-200 dark:border-border",
        // spacing
        "px-3.5 py-2.5 text-sm",
        // typography
        "text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground",
        // shadow
        "shadow-sm",
        // transition
        "transition-[border-color,box-shadow] duration-150",
        // hover
        "hover:border-slate-300 hover:shadow-md",
        // focus
        "outline-none",
        "focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-100 dark:focus-visible:ring-sky-900/30",
        // states
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  );
}

export { Textarea };
