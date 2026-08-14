import { ArrowUpRight } from "lucide-react";

export function StatCard({ label, value, delta }: { label: string; value: number | string; delta: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-accent">
          {delta}<ArrowUpRight className="size-3" />
        </span>
      </div>
      <p className="mt-5 font-mono text-3xl font-medium tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-subtle">nos últimos 30 dias</p>
    </div>
  );
}
