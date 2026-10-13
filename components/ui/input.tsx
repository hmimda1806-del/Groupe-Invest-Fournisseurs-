import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-sm text-foreground outline-none transition focus:border-brand/70 focus:bg-white/8",
        props.className
      )}
    />
  );
}
