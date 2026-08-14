import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function JobNotFound() {
  return <EmptyState icon={BriefcaseBusiness} title="Vaga não encontrada" description="A oportunidade pode ter sido removida ou arquivada." action={<Button asChild><Link href="/vagas">Voltar para vagas</Link></Button>} />;
}
