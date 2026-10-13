import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-4xl border border-white/10 bg-white/8 p-6 shadow-soft backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
