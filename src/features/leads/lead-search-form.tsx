"use client";

import { ExternalLink, Loader2, MapPin, Plus, Radar, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEAD_SEGMENTS } from "@/lib/constants";
import type { LeadResult } from "@/services/lead-provider";

export function LeadSearchForm({ configured }: { configured: boolean }) {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<LeadResult[]>([]);

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSearching(true);
    setResults([]);
    try {
      const response = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: form.get("niche"), location: form.get("location"), limit: Number(form.get("limit")), withoutWebsite: form.get("withoutWebsite") === "on" }),
      });
      const payload = (await response.json()) as { results?: LeadResult[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível buscar oportunidades.");
      setResults(payload.results ?? []);
      if (!payload.results?.length) toast.info("Nenhuma empresa sem site foi encontrada com esses parâmetros.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível buscar oportunidades.");
    } finally {
      setSearching(false);
    }
  }

  return <div className="space-y-5">
    <form onSubmit={search} className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border p-5"><h2 className="text-sm font-semibold">Parâmetros da busca</h2><p className="mt-1 text-xs text-muted-foreground">Busca oficial em estabelecimentos públicos do Google Places.</p></div>
      <div className="grid gap-5 p-5 md:grid-cols-2">
        <div><Label htmlFor="niche">Segmento</Label><select name="niche" id="niche" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none">{LEAD_SEGMENTS.map((segment) => <option key={segment}>{segment}</option>)}</select></div>
        <div><Label htmlFor="location">Localização</Label><div className="relative"><MapPin className="absolute left-3 top-3 size-4 text-subtle" /><Input name="location" id="location" defaultValue="Recife - PE" className="pl-9" required /></div></div>
        <div><Label htmlFor="limit">Quantidade</Label><Input name="limit" id="limit" type="number" min={1} max={20} defaultValue={10} /></div>
        <div><Label>Filtro de oportunidade</Label><label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground"><input name="withoutWebsite" type="checkbox" defaultChecked className="accent-[#6d95ff]" />Somente empresas sem site informado</label></div>
      </div>
      <div className="flex flex-col justify-between gap-3 border-t border-border p-5 sm:flex-row sm:items-center"><p className="inline-flex items-center gap-2 text-[11px] text-subtle"><ShieldCheck className="size-3.5" />Resultados temporários; nenhum dado é salvo automaticamente.</p><Button type="submit" disabled={searching || !configured}>{searching ? <Loader2 className="size-4 animate-spin" /> : <Radar className="size-4" />}{configured ? "Buscar oportunidades" : "Configure a chave do Google"}</Button></div>
    </form>
    {results.length ? <section className="space-y-3" aria-live="polite">
      <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Resultados sem site ({results.length})</h2><span translate="no" className="text-xs font-medium text-muted-foreground">Google Maps</span></div>
      {results.map((result) => <article key={result.placeId} className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h3 className="font-medium">{result.businessName}</h3><p className="mt-1 text-xs text-muted-foreground">{result.formattedAddress ?? "Endereço não informado"}</p>{result.phone ? <p className="mt-1 text-xs text-muted-foreground">{result.phone}</p> : null}</div><div className="flex flex-wrap gap-2"><Button asChild size="sm" variant="secondary"><a href={result.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" />Abrir no Google Maps</a></Button><Button asChild size="sm"><Link href="/leads/novo"><Plus className="size-3.5" />Cadastrar após revisar</Link></Button></div></div>
        <p className="mt-4 text-[11px] text-subtle">O cadastro é manual para confirmar a precisão, a finalidade e a permissão de contato.</p>
      </article>)}
    </section> : null}
  </div>;
}
