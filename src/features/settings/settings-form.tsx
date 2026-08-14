"use client";

import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm() { return <form onSubmit={(event) => { event.preventDefault(); toast.success("Perfil atualizado."); }} className="max-w-2xl space-y-5 rounded-xl border border-border bg-surface p-5"><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="name">Nome</Label><Input id="name" defaultValue="Diego Silva" /></div><div><Label htmlFor="email">E-mail</Label><Input id="email" type="email" defaultValue="demo@opportunityos.local" /></div><div><Label htmlFor="city">Cidade</Label><Input id="city" defaultValue="Recife" /></div><div><Label htmlFor="state">UF</Label><Input id="state" defaultValue="PE" /></div></div><Button type="submit"><Save className="size-4" />Salvar perfil</Button></form>; }

export function PreferencesForm() { return <form onSubmit={(event) => { event.preventDefault(); toast.success("Preferências salvas."); }} className="max-w-2xl space-y-3 rounded-xl border border-border bg-surface p-5">{[["Lembretes de follow-up", "Exibir no dashboard quando um follow-up estiver próximo."], ["Currículo pronto", "Notificar quando uma versão personalizada for concluída."], ["Lead qualificado", "Notificar quando um lead atingir o score configurado."]].map(([title, description]) => <label key={title} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"><input type="checkbox" defaultChecked className="mt-0.5 accent-[#6d95ff]" /><span><strong className="block text-xs font-medium">{title}</strong><span className="mt-1 block text-[11px] text-muted-foreground">{description}</span></span></label>)}<Button type="submit" className="mt-2"><Save className="size-4" />Salvar preferências</Button></form>; }
