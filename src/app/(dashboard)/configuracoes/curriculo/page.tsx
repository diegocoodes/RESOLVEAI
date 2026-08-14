import { PageHeader } from "@/components/page-header";
import { MasterResumeForm } from "@/features/resume/master-resume-form";
export const metadata = { title: "Currículo mestre" };
export default function MasterResumePage() { return <div className="mx-auto max-w-5xl space-y-6"><PageHeader eyebrow="Configurações" title="Currículo Mestre" description="Sua fonte de verdade profissional. Toda análise e versão personalizada será limitada às informações registradas aqui." /><MasterResumeForm /></div>; }
