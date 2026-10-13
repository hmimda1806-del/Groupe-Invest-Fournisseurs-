import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  Bot,
  ChartColumnBig,
  FileUp,
  LayoutDashboard,
  Search,
  Settings2
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload PDF", icon: FileUp },
  { href: "/chat", label: "Chat PDF", icon: Bot },
  { href: "#", label: "Reports", icon: ChartColumnBig },
  { href: "#", label: "Settings", icon: Settings2 }
];

export function AppShell({
  title,
  description,
  children,
  activePath
}: {
  title: string;
  description: string;
  children: ReactNode;
  activePath: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 px-5 py-6 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-brand-secondary shadow-glow">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <p className="font-semibold">PDF Insight</p>
              <p className="text-sm text-foreground/55">Analytics AI platform</p>
            </div>
          </div>
          <nav className="mt-8 grid gap-2">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition hover:bg-white/8",
                  activePath === link.href ? "bg-white/10 text-white" : "text-foreground/62"
                )}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-4xl border border-brand/20 bg-gradient-to-br from-brand/14 to-brand-secondary/12 p-5">
            <p className="text-sm text-foreground/66">AI Workspace</p>
            <p className="mt-2 text-lg font-semibold">Transformez chaque rapport en decisions claires.</p>
            <p className="mt-3 text-sm leading-6 text-foreground/60">
              Resumes, alertes et tendances detectees sans quitter le dashboard.
            </p>
          </div>
        </aside>
        <main className="px-4 py-4 md:px-6 lg:px-8">
          <header className="sticky top-0 z-20 mb-6 rounded-[28px] border border-white/10 bg-background/70 px-4 py-4 backdrop-blur-xl md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="mt-1 text-sm text-foreground/58">{description}</p>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative min-w-[260px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                  <Input className="pl-11" placeholder="Rechercher rapports, insights, KPI..." />
                </div>
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                  <Bell size={18} />
                </button>
                <ThemeToggle />
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
