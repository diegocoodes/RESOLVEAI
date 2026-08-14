"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JOB_STATUSES } from "@/lib/constants";

const applications = [
  { id: "1", job: "Frontend Developer Pleno", company: "Nimbus Tecnologia", status: "INTERVIEW", match: 91 },
  { id: "2", job: "Desenvolvedor Full Stack", company: "Atlas Commerce", status: "APPLIED", match: 84 },
  { id: "3", job: "Frontend Engineer Jr.", company: "Pulse Health", status: "RESUME_GENERATED", match: 78 },
];

export function ApplicationPipeline() {
  const [items, setItems] = useState(applications);
  function advance(id: string) {
    setItems((current) => current.map((item) => {
      if (item.id !== id) return item;
      const index = JOB_STATUSES.findIndex((status) => status.value === item.status);
      return { ...item, status: JOB_STATUSES[Math.min(index + 1, JOB_STATUSES.length - 1)].value };
    }));
    toast.success("Candidatura atualizada.");
  }
  return <div className="overflow-hidden rounded-xl border border-border bg-surface"><div className="hidden overflow-x-auto md:block"><table className="w-full text-left"><thead><tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wider text-subtle"><th className="px-5 py-3">Oportunidade</th><th className="px-4 py-3">Match</th><th className="px-4 py-3">Etapa atual</th><th className="px-5 py-3 text-right">Ação manual</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-border last:border-0"><td className="px-5 py-4"><p className="text-sm font-medium">{item.job}</p><p className="mt-1 text-xs text-muted-foreground">{item.company}</p></td><td className="px-4 font-mono text-sm text-accent">{item.match}%</td><td className="px-4"><Badge variant="neutral">{JOB_STATUSES.find((status) => status.value === item.status)?.label}</Badge></td><td className="px-5 text-right"><Button size="sm" variant="ghost" onClick={() => advance(item.id)}>Avançar etapa<ChevronRight className="size-3.5" /></Button></td></tr>)}</tbody></table></div><div className="divide-y divide-border md:hidden">{items.map((item) => <article key={item.id} className="p-4"><div className="flex justify-between"><div><p className="text-sm font-medium">{item.job}</p><p className="mt-1 text-xs text-muted-foreground">{item.company}</p></div><span className="font-mono text-accent">{item.match}%</span></div><div className="mt-4 flex justify-between"><Badge variant="neutral">{JOB_STATUSES.find((status) => status.value === item.status)?.label}</Badge><Button size="sm" variant="ghost" onClick={() => advance(item.id)}>Avançar<ChevronRight className="size-3.5" /></Button></div></article>)}</div></div>;
}
