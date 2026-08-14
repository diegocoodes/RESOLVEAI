"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  AtSign,
  ChevronRight,
  FileText,
  History,
  Globe2,
  LayoutDashboard,
  MessagesSquare,
  Network,
  Radar,
  Send,
  Settings2,
  Sparkles,
  UserRound,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: LucideIcon };
type NavGroup = { label?: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  { items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "Oportunidades",
    items: [
      { label: "Vagas", href: "/vagas", icon: BriefcaseBusiness },
      { label: "Currículos", href: "/curriculos", icon: FileText },
    ],
  },
  {
    label: "Prospecção",
    items: [
      { label: "Buscar leads", href: "/prospeccao", icon: Radar },
      { label: "Leads", href: "/leads", icon: UsersRound },
      { label: "Campanhas", href: "/campanhas", icon: Send },
      { label: "Mensagens", href: "/mensagens", icon: MessagesSquare },
      { label: "Pipeline", href: "/pipeline", icon: Workflow },
      { label: "Clientes", href: "/clientes", icon: Building2 },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { label: "Análises IA", href: "/analises", icon: Sparkles },
      { label: "Histórico", href: "/historico", icon: History },
    ],
  },
  {
    label: "Configurações",
    items: [
      { label: "Meu perfil", href: "/configuracoes/perfil", icon: UserRound },
      { label: "Currículo mestre", href: "/configuracoes/curriculo", icon: FileText },
      { label: "Integrações", href: "/configuracoes/integracoes", icon: Network },
      { label: "Preferências", href: "/configuracoes/preferencias", icon: Settings2 },
    ],
  },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-[68px] items-center border-b border-border px-5">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <span className="grid size-8 place-items-center rounded-lg bg-accent text-xs font-bold text-accent-foreground">DC</span>
          <span>
            <span className="block text-sm font-semibold leading-4 tracking-tight">diegocodes.com.br</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">Workspace Diego Codes</span>
          </span>
        </Link>
      </div>

      <nav aria-label="Navegação principal" className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label ?? groupIndex}>
            {group.label ? (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">{group.label}</p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={active ? 2.25 : 1.75} />
                    <span className="flex-1">{item.label}</span>
                    {active ? <ChevronRight className="size-3.5" /> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <a href="https://diegocodes.com.br" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground"><Globe2 className="size-3.5 text-accent" />diegocodes.com.br</a>
        <a href="https://www.instagram.com/diegocodes_/" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground"><AtSign className="size-3.5 text-accent" />@diegocodes_</a>
      </div>
    </div>
  );
}
