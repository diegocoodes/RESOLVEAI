import Link from "next/link";
import { Download, Eye, FileText, Pencil, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Currículos" };
const versions = [{ title: "Frontend Developer Pleno", company: "Nimbus Tecnologia", date: "12 ago 2026", match: 91 }, { title: "Desenvolvedor Full Stack", company: "Atlas Commerce", date: "11 ago 2026", match: 84 }];
export default function ResumesPage() { return <div className="space-y-6"><PageHeader eyebrow="Oportunidades" title="Currículos" description="Versões personalizadas, rastreáveis e limitadas aos fatos do seu currículo mestre." actions={<Button asChild variant="secondary"><Link href="/configuracoes/curriculo"><Pencil className="size-4" />Editar currículo mestre</Link></Button>} /><div className="grid gap-4 lg:grid-cols-2">{versions.map((resume) => <Card key={resume.company}><CardContent className="p-5"><div className="flex items-start gap-4"><span className="grid size-11 place-items-center rounded-lg border border-border bg-background"><FileText className="size-5 text-accent" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-medium">{resume.title}</h2><Badge>{resume.match}% match</Badge></div><p className="mt-1 text-xs text-muted-foreground">{resume.company} · Versão 1 · {resume.date}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Button asChild size="sm" variant="secondary"><Link href="/curriculos/gerado"><Eye className="size-3.5" />Visualizar</Link></Button><Button asChild size="sm"><a href="/api/resumes/demo/pdf" download><Download className="size-3.5" />Baixar PDF</a></Button><Button size="sm" variant="ghost"><RefreshCw className="size-3.5" />Regenerar</Button></div></CardContent></Card>)}</div></div>; }
