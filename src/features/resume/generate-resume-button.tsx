"use client";
import { FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function GenerateResumeButton({ jobId, className }: { jobId: string; className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function generate() {
    setLoading(true);
    try {
      const response = await fetch("/api/resumes/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }) });
      const result = (await response.json()) as { id?: string; error?: string; provider?: string };
      if (!response.ok || !result.id) throw new Error(result.error ?? "Não foi possível gerar o currículo.");
      toast.success(result.provider === "openai" ? "Currículo ATS organizado com OpenAI." : "Currículo ATS gerado em modo seguro.");
      router.push(`/curriculos/gerado?id=${result.id}`);
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível gerar o currículo."); }
    finally { setLoading(false); }
  }
  return <Button className={className} onClick={generate} disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}{loading ? "Gerando..." : "Gerar currículo ATS"}</Button>;
}
