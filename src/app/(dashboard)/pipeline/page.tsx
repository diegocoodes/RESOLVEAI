import { LayoutGrid, List } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PipelineBoard } from "@/features/crm/pipeline-board";

export const metadata = { title: "Pipeline" };
export default function PipelinePage() { return <div className="space-y-6"><PageHeader eyebrow="CRM" title="Pipeline comercial" description="Mova cada oportunidade pela jornada. Toda alteração importante fica registrada no histórico." actions={<div className="flex rounded-lg border border-border bg-surface p-1"><Button size="sm" className="h-7"><LayoutGrid className="size-3.5" />Kanban</Button><Button size="sm" variant="ghost" className="h-7"><List className="size-3.5" />Lista</Button></div>} /><PipelineBoard /></div>; }
