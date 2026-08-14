import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { JobsTable } from "@/features/jobs/jobs-table";
import { getJobsForUser } from "@/services/opportunity-data.service";

export const metadata = { title: "Vagas" };

export default async function JobsPage() {
  const session = await auth();
  const jobs = await getJobsForUser(session?.user.id);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Oportunidades" title="Vagas" description="Centralize oportunidades, compare requisitos e priorize onde você tem mais aderência." actions={<Button asChild><Link href="/vagas/nova"><Plus className="size-4" />Cadastrar vaga</Link></Button>} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Total", jobs.length], ["Match alto", jobs.filter((job) => job.match >= 80).length], ["Analisadas", jobs.filter((job) => job.status === "Analisada").length], ["Currículos prontos", jobs.filter((job) => job.status === "Currículo gerado").length]].map(([label, value]) => <div key={label} className="rounded-lg border border-border bg-surface px-4 py-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 font-mono text-xl font-medium">{value}</p></div>)}
      </div>
      <JobsTable jobs={jobs} />
    </div>
  );
}
