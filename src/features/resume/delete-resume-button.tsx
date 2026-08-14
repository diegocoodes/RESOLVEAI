"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteResumeButton({ resumeId, afterDeleteHref }: { resumeId: string; afterDeleteHref?: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!window.confirm("Excluir permanentemente esta versão do currículo? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    const response = await fetch(`/api/resumes/${resumeId}`, { method: "DELETE" });
    setDeleting(false);
    if (!response.ok) {
      toast.error("Não foi possível excluir o currículo.");
      return;
    }
    toast.success("Currículo excluído.");
    if (afterDeleteHref) {
      router.push(afterDeleteHref);
      return;
    }
    router.refresh();
  }

  return <Button type="button" size="sm" variant="destructive" onClick={remove} disabled={deleting}>{deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}Excluir</Button>;
}
