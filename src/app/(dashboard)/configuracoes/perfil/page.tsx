import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ResumeRepository } from "@/repositories/resume.repository";
export const metadata = { title: "Meu perfil" };
export default async function ProfilePage() { const session = await auth(); const resume = session?.user.id ? await new ResumeRepository().findMaster(session.user.id) : null; return <div className="space-y-6"><PageHeader eyebrow="Configurações" title="Meu perfil" description="Dados reais da sua conta e do currículo mestre." /><Card className="max-w-2xl"><CardContent className="grid gap-5 p-5 sm:grid-cols-2"><Field label="Nome" value={session?.user.name ?? "Não informado"} /><Field label="E-mail" value={session?.user.email ?? "Não informado"} /><Field label="Cidade" value={resume?.city ?? "Não informada"} /><Field label="UF" value={resume?.state ?? "Não informada"} /></CardContent></Card></div>; }
function Field({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-subtle">{label}</p><p className="mt-1 text-sm">{value}</p></div>; }
