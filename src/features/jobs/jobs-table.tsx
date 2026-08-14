"use client";

import Link from "next/link";
import { ArrowUpDown, ExternalLink, MoreHorizontal, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { DemoJob } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";

export function JobsTable({ jobs }: { jobs: DemoJob[] }) {
  const [query, setQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");
  const filtered = useMemo(() => jobs.filter((job) => {
    const matchesQuery = `${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesScore = matchFilter === "all" || (matchFilter === "80" ? job.match >= 80 : job.match < 80);
    return matchesQuery && matchesScore;
  }), [jobs, query, matchFilter]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1"><Search className="absolute left-3 top-3 size-4 text-subtle" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="bg-background pl-9" placeholder="Buscar cargo, empresa ou tecnologia" /></div>
        <select value={matchFilter} onChange={(event) => setMatchFilter(event.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground outline-none">
          <option value="all">Todos os matches</option><option value="80">Match ≥ 80%</option><option value="under">Match abaixo de 80%</option>
        </select>
        <Button variant="secondary" size="sm"><ArrowUpDown className="size-3.5" />Mais recentes</Button>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[920px] text-left">
          <thead><tr className="border-b border-border text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle"><th className="px-5 py-3">Vaga</th><th className="px-4 py-3">Localização</th><th className="px-4 py-3">Origem / data</th><th className="w-36 px-4 py-3">Match</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Ações</th></tr></thead>
          <tbody>
            {filtered.map((job) => (
              <tr key={job.id} className="group border-b border-border last:border-0 hover:bg-surface-hover/50">
                <td className="px-5 py-4"><Link href={`/vagas/${job.id}`} className="font-medium text-sm hover:text-accent">{job.title}</Link><p className="mt-1 text-xs text-muted-foreground">{job.company}</p><div className="mt-2 flex gap-1.5">{job.skills.slice(0, 3).map((skill) => <Badge key={skill} variant="neutral">{skill}</Badge>)}</div></td>
                <td className="px-4 py-4 text-xs text-muted-foreground"><p>{job.location}</p><p className="mt-1 text-subtle">{job.mode}</p></td>
                <td className="px-4 py-4 text-xs text-muted-foreground"><p>{job.source}</p><p className="mt-1 text-subtle">{formatDate(job.date)}</p></td>
                <td className="px-4 py-4"><div className="mb-2 flex items-center justify-between"><span className="font-mono text-sm font-semibold text-foreground">{job.match}%</span><span className="text-[10px] text-muted-foreground">{job.match >= 80 ? "Alto" : "Moderado"}</span></div><Progress value={job.match} /></td>
                <td className="px-4 py-4"><Badge variant={job.status === "Currículo gerado" ? "success" : "neutral"}>{job.status}</Badge></td>
                <td className="px-5 py-4"><div className="flex justify-end gap-1"><Button asChild variant="ghost" size="sm"><Link href={`/vagas/${job.id}`}><Sparkles className="size-3.5" />Analisar</Link></Button><Button variant="ghost" size="icon" className="size-8" aria-label="Mais ações"><MoreHorizontal className="size-4" /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {filtered.map((job) => (
          <article key={job.id} className="p-4">
            <div className="flex items-start justify-between gap-3"><div><Link href={`/vagas/${job.id}`} className="text-sm font-medium">{job.title}</Link><p className="mt-1 text-xs text-muted-foreground">{job.company} · {job.mode}</p></div><span className="font-mono text-base font-semibold text-accent">{job.match}%</span></div>
            <div className="mt-3 flex flex-wrap gap-1.5">{job.skills.map((skill) => <Badge key={skill} variant="neutral">{skill}</Badge>)}</div>
            <div className="mt-4 flex items-center justify-between"><Badge variant="neutral">{job.status}</Badge><Button asChild variant="ghost" size="sm"><Link href={`/vagas/${job.id}`}>Ver detalhes<ExternalLink className="size-3.5" /></Link></Button></div>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? <div className="px-5 py-16 text-center"><p className="text-sm font-medium">Nenhuma vaga encontrada.</p><p className="mt-1 text-xs text-muted-foreground">Ajuste os filtros ou cadastre uma nova oportunidade.</p></div> : null}
      <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-subtle"><span>{filtered.length} de {jobs.length} vagas</span><span>Página 1 de 1</span></div>
    </div>
  );
}
