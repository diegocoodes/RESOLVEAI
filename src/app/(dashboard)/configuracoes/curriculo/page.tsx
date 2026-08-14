import { ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ResumeRepository } from "@/repositories/resume.repository";

export const metadata = { title: "Currículo mestre" };

export default async function MasterResumePage() {
  const session = await auth();
  const resume = session?.user.id ? await new ResumeRepository().findMaster(session.user.id) : null;
  return <div className="mx-auto max-w-5xl space-y-6"><PageHeader eyebrow="Configurações" title="Currículo Mestre" description="Fonte de verdade importada do seu PDF. A IA pode ordenar estes fatos, mas não alterar nem inventar experiências." />
    {!resume ? <Card><CardContent className="p-6 text-sm text-muted-foreground">O currículo mestre ainda não foi importado.</CardContent></Card> : <>
      <div className="flex gap-3 rounded-lg border border-accent/20 bg-accent/[0.06] p-4"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" /><p className="text-xs leading-5 text-muted-foreground">Origem verificada: currículo principal de Diego Ewerton. Datas não presentes no documento foram mantidas como não informadas.</p></div>
      <Card><CardHeader><div><h2 className="text-lg font-semibold">{resume.user.name}</h2><p className="mt-1 text-xs text-muted-foreground">{resume.user.email} · {resume.phone} · {[resume.city, resume.state].filter(Boolean).join(", ")}</p></div></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{resume.summary}</p></CardContent></Card>
      <Section title="Competências"><div className="flex flex-wrap gap-2">{resume.skills.map((skill) => <span key={skill.id} className="rounded-md border border-border bg-background px-2.5 py-1 text-xs">{skill.name}</span>)}</div></Section>
      <Section title="Experiência">{resume.experiences.map((item) => <div key={item.id} className="border-b border-border pb-5 last:border-0 last:pb-0"><h3 className="text-sm font-semibold">{item.role} · {item.company}</h3><p className="mt-1 text-xs text-subtle">{item.location ?? "Local não informado"} · {item.current ? "Atual" : "Período não informado"}</p><p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{item.description}</p></div>)}</Section>
      <Section title="Formação">{resume.education.map((item) => <p key={item.id} className="text-sm"><strong>{item.course}</strong> · {item.institution}{item.endedAt ? ` · ${item.endedAt.getUTCFullYear()}` : ""}</p>)}</Section>
      <Section title="Certificações"><ul className="space-y-2 text-sm text-muted-foreground">{resume.certifications.map((item) => <li key={item.id}>{item.name} · {item.issuer}{item.issuedAt ? ` · ${item.issuedAt.toLocaleDateString("pt-BR", { timeZone: "UTC", month: "short", year: "numeric" })}` : ""}</li>)}</ul></Section>
    </>}
  </div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <Card><CardHeader><h2 className="text-sm font-semibold">{title}</h2></CardHeader><CardContent className="space-y-5">{children}</CardContent></Card>; }
