"use client";

import { Loader2, MapPin, Radar, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEAD_SEGMENTS } from "@/lib/constants";

export function LeadSearchForm() {
  const [searching, setSearching] = useState(false);
  async function search(event: React.FormEvent) {
    event.preventDefault();
    setSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSearching(false);
    toast.info("Provider de descoberta ainda não conectado. Use o cadastro manual ou configure uma API autorizada.");
  }
  return (
    <form onSubmit={search} className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border p-5"><h2 className="text-sm font-semibold">Parâmetros da busca</h2><p className="mt-1 text-xs text-muted-foreground">Descubra empresas em fontes públicas e integrações permitidas.</p></div>
      <div className="grid gap-5 p-5 md:grid-cols-2">
        <div><Label htmlFor="segment">Segmento</Label><select id="segment" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none">{LEAD_SEGMENTS.map((segment) => <option key={segment}>{segment}</option>)}</select></div>
        <div><Label htmlFor="location">Localização</Label><div className="relative"><MapPin className="absolute left-3 top-3 size-4 text-subtle" /><Input id="location" defaultValue="Recife - PE" className="pl-9" /></div></div>
        <div><Label htmlFor="quantity">Quantidade</Label><Input id="quantity" type="number" min={1} max={100} defaultValue={30} /></div>
        <div><Label>Filtros de oportunidade</Label><div className="grid grid-cols-2 gap-2">{[["Sem site", true], ["Instagram", true], ["WhatsApp", true], ["Site ruim", false]].map(([label, checked]) => <label key={String(label)} className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground"><input type="checkbox" defaultChecked={Boolean(checked)} className="accent-[#6d95ff]" />{label}</label>)}</div></div>
      </div>
      <div className="flex flex-col justify-between gap-3 border-t border-border p-5 sm:flex-row sm:items-center"><p className="inline-flex items-center gap-2 text-[11px] text-subtle"><ShieldCheck className="size-3.5" />Sem scraping de áreas privadas, autenticação ou CAPTCHA.</p><Button type="submit" disabled={searching}>{searching ? <Loader2 className="size-4 animate-spin" /> : <Radar className="size-4" />}Buscar oportunidades</Button></div>
    </form>
  );
}
