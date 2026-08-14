"use client";

import { AtSign, ExternalLink, Globe2, Loader2, Map, MapPin, Plus, Radar, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEAD_SEGMENTS } from "@/lib/constants";
import type { LeadResult } from "@/services/lead-provider";

type LastSearch = { query: string; location: string; withoutWebsite: boolean };

function externalSearchLinks(query: string, location: string) {
  const broad = `${query} ${location}`.trim();
  return [
    { label: "Pesquisar no Google", detail: "Busca ampla por nome ou profissão", href: `https://www.google.com/search?q=${encodeURIComponent(broad)}`, icon: Search },
    { label: "Pesquisar no Google Maps", detail: "Empresas, avaliações, telefone e rotas", href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(broad)}`, icon: Map },
    { label: "Pesquisar no Instagram", detail: "Perfis e conteúdo; pode exigir login", href: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(query)}`, icon: AtSign },
    { label: "Instagram via Google", detail: "Encontra perfis públicos indexados", href: `https://www.google.com/search?q=${encodeURIComponent(`site:instagram.com ${broad}`)}`, icon: Globe2 },
  ];
}

function leadHref(result: LeadResult, search: LastSearch) {
  const params = new URLSearchParams({ businessName: result.businessName, niche: search.query, source: "OPENSTREETMAP", sourceUrl: result.sourceUrl, googleBusiness: result.sourceUrl });
  if (result.phone) params.set("phone", result.phone);
  const [city, state] = search.location.split(/[,\-]/).map((item) => item.trim());
  if (city) params.set("city", city);
  if (state?.length === 2) params.set("state", state.toUpperCase());
  return `/leads/novo?${params.toString()}`;
}

export function LeadSearchForm() {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("personal");
  const [location, setLocation] = useState("Recife - PE");
  const [results, setResults] = useState<LeadResult[]>([]);
  const [lastSearch, setLastSearch] = useState<LastSearch | null>(null);

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = { query: query.trim(), location: location.trim(), withoutWebsite: form.get("withoutWebsite") === "on" };
    setSearching(true);
    setResults([]);
    setLastSearch(current);
    try {
      const response = await fetch("/api/leads/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ niche: current.query, location: current.location, limit: Number(form.get("limit")), withoutWebsite: current.withoutWebsite }) });
      const payload = (await response.json()) as { results?: LeadResult[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível buscar oportunidades.");
      setResults(payload.results ?? []);
      if (!payload.results?.length) toast.info("A fonte aberta não encontrou resultados. Use os atalhos do Google e Instagram abaixo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível buscar oportunidades.");
    } finally { setSearching(false); }
  }

  const links = externalSearchLinks(query.trim() || "personal", location.trim());
  return <div className="space-y-5">
    <form onSubmit={search} className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border p-5"><h2 className="text-sm font-semibold">Pesquisa livre de profissionais</h2><p className="mt-1 text-xs text-muted-foreground">Digite profissão, nome ou os dois: “personal”, “personal diego”, “nutricionista ana”.</p></div>
      <div className="grid gap-5 p-5 md:grid-cols-2">
        <div><Label htmlFor="niche">O que deseja encontrar?</Label><Input name="niche" id="niche" list="lead-search-suggestions" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: personal diego" required /><datalist id="lead-search-suggestions">{LEAD_SEGMENTS.map((segment) => <option key={segment} value={segment} />)}</datalist></div>
        <div><Label htmlFor="location">Localização</Label><div className="relative"><MapPin className="absolute left-3 top-3 size-4 text-subtle" /><Input name="location" id="location" value={location} onChange={(event) => setLocation(event.target.value)} className="pl-9" placeholder="Recife - PE" required /></div></div>
        <div><Label htmlFor="limit">Quantidade interna</Label><Input name="limit" id="limit" type="number" min={1} max={20} defaultValue={10} /></div>
        <div><Label>Filtro do OpenStreetMap</Label><label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground"><input name="withoutWebsite" type="checkbox" defaultChecked className="accent-[#6d95ff]" />Somente profissionais sem site informado</label></div>
      </div>
      <div className="flex flex-col justify-between gap-3 border-t border-border p-5 sm:flex-row sm:items-center"><p className="inline-flex items-center gap-2 text-[11px] text-subtle"><ShieldCheck className="size-3.5" />Resultados externos são revisados e cadastrados manualmente.</p><Button type="submit" disabled={searching}>{searching ? <Loader2 className="size-4 animate-spin" /> : <Radar className="size-4" />}Buscar em todas as fontes</Button></div>
    </form>

    <section className="rounded-xl border border-border bg-surface p-5"><div className="mb-4"><h2 className="text-sm font-semibold">Pesquisar também na web e redes sociais</h2><p className="mt-1 text-xs text-muted-foreground">Os atalhos usam o texto exatamente como foi digitado e abrem a fonte oficial para sua revisão.</p></div><div className="grid gap-3 sm:grid-cols-2">{links.map(({ label, detail, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition hover:bg-surface-hover"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent/10"><Icon className="size-4 text-accent" /></span><span className="min-w-0 flex-1"><strong className="block text-sm font-medium">{label}</strong><span className="mt-1 block text-xs text-muted-foreground">{detail}</span></span><ExternalLink className="size-3.5 text-subtle" /></a>)}</div></section>

    {lastSearch ? <section className="space-y-3" aria-live="polite"><div className="flex items-center justify-between gap-4"><h2 className="text-sm font-semibold">OpenStreetMap · {lastSearch.withoutWebsite ? "sem site" : "todos"} ({results.length})</h2><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-right text-xs font-medium text-muted-foreground hover:text-foreground">© OpenStreetMap contributors</a></div>
      {results.map((result) => <article key={result.externalId} className="rounded-xl border border-border bg-surface p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h3 className="font-medium">{result.businessName}</h3><p className="mt-1 text-xs text-muted-foreground">{result.formattedAddress ?? "Endereço não informado"}</p>{result.phone ? <p className="mt-1 text-xs text-muted-foreground">{result.phone}</p> : null}</div><div className="flex flex-wrap gap-2"><Button asChild size="sm" variant="secondary"><a href={result.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" />Ver origem</a></Button><Button asChild size="sm"><Link href={leadHref(result, lastSearch)}><Plus className="size-3.5" />Revisar e cadastrar</Link></Button></div></div><p className="mt-4 text-[11px] text-subtle">Confirme as informações e a finalidade do contato antes de salvar.</p></article>)}
      {!results.length && !searching ? <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-subtle">Nenhum resultado interno. Tente os atalhos do Google e Instagram acima.</div> : null}
    </section> : null}
  </div>;
}
