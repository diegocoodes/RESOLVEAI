import Link from "next/link";
import { UsersRound } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
export default function LeadNotFound() { return <EmptyState icon={UsersRound} title="Lead não encontrado" description="O contato pode ter sido removido para atender a uma solicitação de privacidade." action={<Button asChild><Link href="/leads">Voltar para leads</Link></Button>} />; }
