import { PageHeader } from "@/components/page-header";
import { PreferencesForm } from "@/features/settings/settings-form";
export const metadata = { title: "Preferências" };
export default function PreferencesPage() { return <div className="space-y-6"><PageHeader eyebrow="Configurações" title="Preferências" description="Defina lembretes e notificações internas. Nenhuma automação envia mensagens por conta própria." /><PreferencesForm /></div>; }
