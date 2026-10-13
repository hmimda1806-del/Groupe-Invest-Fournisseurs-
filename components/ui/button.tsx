import Link from "next/link";
import { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
};

const styles = {
  primary:
    "bg-gradient-to-r from-brand to-brand-secondary text-white shadow-glow hover:scale-[1.01] hover:brightness-110",
  secondary:
    "border border-white/12 bg-white/8 text-foreground hover:bg-white/12",
  ghost: "text-foreground/72 hover:bg-white/8"
};

export function Button({
  children,
  href,
  variant = "primary",
  className,
  onClick
}: ButtonProps) {
  const base = cn(
    "inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-medium transition-all duration-300",
    styles[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={base} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={base} onClick={onClick}>
      {children}
    </button>
  );
}
