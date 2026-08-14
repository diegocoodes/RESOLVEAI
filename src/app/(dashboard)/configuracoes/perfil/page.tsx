import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/features/settings/settings-form";
export const metadata = { title: "Meu perfil" };
export default function ProfilePage() { return <div className="space-y-6"><PageHeader eyebrow="Configurações" title="Meu perfil" description="Dados básicos da sua conta e localização principal." /><ProfileForm /></div>; }
