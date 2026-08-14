"use client";

import { ChevronLeft, ChevronRight, CircleAlert, FileCheck2, FileUp, Layers3, Loader2, ShieldCheck, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PreviewRecord = {
  row: number;
  name: string;
  address: string;
  phone: string;
  phoneNormalized: string;
  segment: string;
  segmentSource: "file" | "name";
};

type ImportIssue = { row: number; sheet?: string; name: string; segment?: string; reason: string };
type ImportPreview = {
  fileName: string;
  total: number;
  ready: number;
  duplicateCount: number;
  rejectedCount: number;
  segments: Array<{ name: string; count: number }>;
  records: PreviewRecord[];
  duplicates: ImportIssue[];
  rejected: ImportIssue[];
};

const PAGE_SIZE = 5;

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^55/, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return phone;
}

export function LeadSpreadsheetImport() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<ImportPreview>();
  const [working, setWorking] = useState<"preview" | "import">();
  const [page, setPage] = useState(1);

  async function sendFile(selectedFile: File, action: "preview" | "import") {
    const form = new FormData();
    form.append("file", selectedFile);
    form.append("action", action);
    setWorking(action);
    try {
      const response = await fetch("/api/leads/import", { method: "POST", body: form });
      const payload = (await response.json()) as ImportPreview & { imported?: number; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível processar a planilha XLS.");

      if (action === "preview") {
        setPreview(payload);
        setPage(1);
        toast.success("Planilha verificada. Revise a organização antes de importar.");
      } else {
        toast.success(`${payload.imported ?? 0} leads importados e organizados por segmento.`);
        router.push("/leads");
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível processar a planilha XLS.");
      if (action === "preview") setPreview(undefined);
    } finally {
      setWorking(undefined);
    }
  }

  function selectFile(selectedFile?: File) {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(undefined);
    void sendFile(selectedFile, "preview");
  }

  function clearFile() {
    setFile(undefined);
    setPreview(undefined);
    setPage(1);
    if (inputRef.current) inputRef.current.value = "";
  }

  const pageCount = Math.max(1, Math.ceil((preview?.records.length ?? 0) / PAGE_SIZE));
  const visibleRecords = preview?.records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  return <div className="space-y-5">
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border p-5">
        <h2 className="text-sm font-semibold">Anexar planilha XLS</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">A planilha deve conter Nome, Endereço e Telefone. O segmento pode vir em uma coluna ou ser identificado com segurança no nome. Todo telefone válido será tratado como WhatsApp.</p>
      </div>
      <div className="p-5">
        <input ref={inputRef} id="lead-xls-file" type="file" accept=".xls,application/vnd.ms-excel" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0])} />
        <label htmlFor="lead-xls-file" className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-accent/40 bg-accent/[0.04] px-5 py-7 text-center transition-colors hover:border-accent hover:bg-accent/[0.07]">
          {working === "preview" ? <Loader2 className="size-7 animate-spin text-accent" /> : preview ? <FileCheck2 className="size-7 text-emerald-400" /> : <FileUp className="size-7 text-accent" />}
          <span className="mt-3 text-sm font-medium">{working === "preview" ? "Verificando planilha..." : file?.name ?? "Selecionar planilha XLS"}</span>
          <span className="mt-1 text-xs text-muted-foreground">Somente .xls, com até 5 MB e 2.000 registros</span>
        </label>
      </div>
      <div className="flex flex-col justify-between gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center">
        <p className="inline-flex items-center gap-2 text-[11px] text-subtle"><ShieldCheck className="size-3.5" />Nada será cadastrado antes da sua confirmação. O botão abrirá o número no WhatsApp.</p>
        {file ? <Button type="button" variant="ghost" size="sm" onClick={clearFile} disabled={Boolean(working)}>Remover arquivo</Button> : null}
      </div>
    </section>

    {preview ? <section className="space-y-5" aria-live="polite">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Summary icon={UsersRound} label="Encontrados" value={preview.total} />
        <Summary icon={FileCheck2} label="Prontos" value={preview.ready} tone="success" />
        <Summary icon={Layers3} label="Duplicados" value={preview.duplicateCount} />
        <Summary icon={CircleAlert} label="Rejeitados" value={preview.rejectedCount} tone={preview.rejectedCount ? "warning" : undefined} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div><h2 className="text-sm font-semibold">Organização por segmento</h2><p className="mt-1 text-xs text-muted-foreground">Segmentos equivalentes são padronizados automaticamente.</p></div>
          <Badge variant="neutral">{preview.segments.length} segmentos</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {preview.segments.map((segment) => <span key={segment.name} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs"><span className="font-medium">{segment.name}</span><span className="ml-2 font-mono text-subtle">{segment.count}</span></span>)}
          {!preview.segments.length ? <p className="text-xs text-muted-foreground">Nenhum segmento válido encontrado.</p> : null}
        </div>
      </div>

      {preview.records.length ? <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Prévia dos leads válidos</h2><p className="mt-1 text-xs text-muted-foreground">Exibindo 5 registros por página.</p></div>
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-border text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle"><th className="px-5 py-3">Nome</th><th className="px-4 py-3">Segmento</th><th className="px-4 py-3">Endereço</th><th className="px-5 py-3">WhatsApp</th></tr></thead><tbody>{visibleRecords.map((record) => <tr key={`${record.row}-${record.phoneNormalized}`} className="border-b border-border last:border-0"><td className="px-5 py-4 text-sm font-medium">{record.name}</td><td className="px-4 py-4"><Badge variant="neutral">{record.segment}</Badge>{record.segmentSource === "name" ? <p className="mt-1 text-[10px] text-subtle">Identificado pelo nome</p> : null}</td><td className="max-w-sm px-4 py-4 text-xs leading-5 text-muted-foreground">{record.address}</td><td className="whitespace-nowrap px-5 py-4 font-mono text-xs">{formatPhone(record.phoneNormalized)}</td></tr>)}</tbody></table></div>
        <div className="divide-y divide-border md:hidden">{visibleRecords.map((record) => <article key={`${record.row}-${record.phoneNormalized}`} className="p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">{record.name}</p><div className="text-right"><Badge variant="neutral">{record.segment}</Badge>{record.segmentSource === "name" ? <p className="mt-1 text-[10px] text-subtle">Pelo nome</p> : null}</div></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{record.address}</p><p className="mt-2 font-mono text-xs">{formatPhone(record.phoneNormalized)}</p></article>)}</div>
        <Pagination page={page} pageCount={pageCount} total={preview.records.length} onPage={setPage} />
      </div> : null}

      {preview.duplicates.length || preview.rejected.length ? <div className="grid gap-4 lg:grid-cols-2">
        <IssueList title="Duplicados ignorados" issues={preview.duplicates} />
        <IssueList title="Registros rejeitados" issues={preview.rejected} />
      </div> : null}

      <div className="flex justify-end">
        <Button type="button" onClick={() => file && void sendFile(file, "import")} disabled={!preview.ready || Boolean(working)}>{working === "import" ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}Importar {preview.ready} leads</Button>
      </div>
    </section> : null}
  </div>;
}

function Summary({ icon: Icon, label, value, tone }: { icon: typeof UsersRound; label: string; value: number; tone?: "success" | "warning" }) {
  const color = tone === "success" ? "text-emerald-400" : tone === "warning" ? "text-amber-400" : "text-accent";
  return <div className="rounded-xl border border-border bg-surface p-4"><div className="flex items-center justify-between"><p className="text-[11px] text-muted-foreground">{label}</p><Icon className={`size-4 ${color}`} /></div><p className="mt-2 font-mono text-2xl font-semibold">{value}</p></div>;
}

function IssueList({ title, issues }: { title: string; issues: ImportIssue[] }) {
  return <details className="rounded-xl border border-border bg-surface p-5" open={Boolean(issues.length)}><summary className="cursor-pointer text-sm font-semibold">{title} ({issues.length})</summary>{issues.length ? <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">{issues.map((issue) => <div key={`${issue.sheet}-${issue.row}-${issue.reason}`} className="rounded-lg border border-border bg-background p-3"><div className="flex justify-between gap-3"><p className="text-xs font-medium">{issue.name}</p><span className="font-mono text-[10px] text-subtle">{issue.sheet ? `${issue.sheet} · ` : ""}Linha {issue.row}</span></div><p className="mt-1 text-[11px] text-muted-foreground">{issue.reason}</p></div>)}</div> : <p className="mt-3 text-xs text-muted-foreground">Nenhum registro nesta categoria.</p>}</details>;
}

function Pagination({ page, pageCount, total, onPage }: { page: number; pageCount: number; total: number; onPage: (page: number) => void }) {
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);
  return <div className="flex flex-col justify-between gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center"><p className="text-xs text-subtle">{first}–{last} de {total}</p><div className="flex items-center gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => onPage(page - 1)} disabled={page === 1}><ChevronLeft className="size-3.5" />Anterior</Button><span className="min-w-20 text-center text-xs text-muted-foreground">Página {page} de {pageCount}</span><Button type="button" size="sm" variant="secondary" onClick={() => onPage(page + 1)} disabled={page === pageCount}>Próxima<ChevronRight className="size-3.5" /></Button></div></div>;
}
