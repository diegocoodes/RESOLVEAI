import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  async function authenticate(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirectTo: "/dashboard" });
    } catch (authError) {
      if (authError instanceof AuthError) redirect("/login?error=credentials");
      throw authError;
    }
  }
  return <main className="grid min-h-screen place-items-center bg-background px-4"><div className="w-full max-w-sm"><div className="mb-8"><span className="grid size-10 place-items-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">OS</span><h1 className="mt-5 text-2xl font-semibold tracking-tight">Entre no Opportunity OS</h1><p className="mt-2 text-sm text-muted-foreground">Seu workspace pessoal de oportunidades.</p></div><form action={authenticate} className="space-y-4 rounded-xl border border-border bg-surface p-5"><div><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" autoComplete="email" required defaultValue="demo@opportunityos.local" /></div><div><Label htmlFor="password">Senha</Label><Input id="password" name="password" type="password" autoComplete="current-password" required defaultValue="Opportunity123!" /></div>{error ? <p role="alert" className="text-xs text-destructive">E-mail ou senha inválidos.</p> : null}<Button type="submit" className="w-full">Entrar</Button></form><p className="mt-4 text-center text-[11px] leading-5 text-subtle">Credenciais de demonstração são criadas pelo comando de seed.<br />Troque a senha antes de usar em produção.</p></div></main>;
}
