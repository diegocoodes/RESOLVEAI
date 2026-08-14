"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, BriefcaseBusiness, LogOut, Menu, Plus, Search, Settings2, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initials } from "@/lib/utils";

const searchableRoutes = [
  { id: "jobs", title: "Vagas", detail: "Oportunidades de emprego", href: "/vagas", type: "Vaga" },
  { id: "leads", title: "Leads", detail: "Oportunidades comerciais", href: "/leads", type: "Lead" },
  { id: "prospecting", title: "Importar leads", detail: "Anexar e organizar arquivo XML", href: "/prospeccao", type: "Lead" },
  { id: "resumes", title: "Currículos", detail: "Versões ATS", href: "/curriculos", type: "Vaga" },
];

export function AppTopbar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const term = query.toLowerCase();
    return searchableRoutes.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(term));
  }, [query]);

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
            <Menu className="size-5" />
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[286px] border-r border-border bg-surface shadow-2xl outline-none">
            <Dialog.Title className="sr-only">Menu principal</Dialog.Title>
            <Dialog.Close className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground" aria-label="Fechar menu">
              <X className="size-4" />
            </Dialog.Close>
            <AppSidebar onNavigate={() => setOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <button onClick={() => setSearchOpen(true)} className="flex h-9 min-w-0 max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-left text-sm text-subtle transition hover:border-[#343434] hover:text-muted-foreground sm:flex-none sm:w-[340px]">
        <Search className="size-4 shrink-0" />
        <span className="truncate">Buscar vagas, leads, campanhas...</span>
        <kbd className="ml-auto hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-subtle sm:block">⌘ K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/vagas/nova"><Plus className="size-3.5" />Nova oportunidade</Link>
        </Button>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
        </Button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="ml-1 flex size-8 items-center justify-center rounded-full border border-border bg-surface-raised text-[11px] font-semibold outline-none focus:ring-2 focus:ring-accent/40" aria-label="Menu da conta">{initials(user.name ?? "Usuário")}</DropdownMenu.Trigger>
          <DropdownMenu.Portal><DropdownMenu.Content align="end" sideOffset={8} className="z-50 min-w-52 rounded-lg border border-border bg-surface p-1 shadow-2xl"><div className="border-b border-border px-3 py-2"><p className="text-xs font-medium">{user.name ?? "Usuário"}</p><p className="mt-0.5 text-[11px] text-subtle">{user.email}</p></div><DropdownMenu.Item asChild><Link href="/configuracoes/perfil" className="mt-1 flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground outline-none hover:bg-surface-hover hover:text-foreground"><Settings2 className="size-3.5" />Configurações</Link></DropdownMenu.Item><DropdownMenu.Item onSelect={() => signOut({ callbackUrl: "/login" })} className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs text-destructive outline-none hover:bg-destructive/10"><LogOut className="size-3.5" />Sair</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <Dialog.Root open={searchOpen} onOpenChange={(value) => { setSearchOpen(value); if (!value) setQuery(""); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
          <Dialog.Content className="fixed left-1/2 top-[18%] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl outline-none">
            <Dialog.Title className="sr-only">Pesquisa global</Dialog.Title>
            <div className="relative border-b border-border"><Search className="absolute left-4 top-4 size-4 text-subtle" /><Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 border-0 bg-transparent pl-11 pr-12 focus:ring-0" placeholder="Buscar vaga, empresa, lead ou segmento..." /><Dialog.Close className="absolute right-3 top-3 grid size-7 place-items-center rounded text-subtle hover:bg-surface-hover hover:text-foreground"><X className="size-3.5" /></Dialog.Close></div>
            <div className="min-h-36 p-2">{query && !searchResults.length ? <div className="grid h-32 place-items-center text-xs text-subtle">Nenhum resultado encontrado.</div> : null}{!query ? <div className="grid h-32 place-items-center text-xs text-subtle">Digite para pesquisar em todo o workspace.</div> : null}{searchResults.map((result) => <Link key={`${result.type}-${result.id}`} href={result.href} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 rounded-lg p-3 hover:bg-surface-hover"><span className="grid size-8 place-items-center rounded-md border border-border bg-background">{result.type === "Vaga" ? <BriefcaseBusiness className="size-3.5 text-accent" /> : <UsersRound className="size-3.5 text-accent" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm">{result.title}</span><span className="block truncate text-xs text-subtle">{result.detail}</span></span><span className="text-[10px] uppercase tracking-wider text-subtle">{result.type}</span></Link>)}</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
