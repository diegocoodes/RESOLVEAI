export type WebsiteAudit = {
  status: "NO_WEBSITE" | "GOOD" | "NEEDS_IMPROVEMENT" | "UNKNOWN";
  isReachable?: boolean;
  hasHttps?: boolean;
  responseTimeMs?: number;
  title?: string;
  metaDescription?: string;
  hasContactCta?: boolean;
  hasWhatsapp?: boolean;
  note?: string;
};

export class WebsiteAuditService {
  async audit(rawUrl?: string | null): Promise<WebsiteAudit> {
    if (!rawUrl) return { status: "NO_WEBSITE", note: "Nenhum site informado." };
    let url: URL;
    try { url = new URL(rawUrl); } catch { return { status: "UNKNOWN", note: "URL inválida; não foi possível verificar." }; }
    const startedAt = performance.now();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8_000), redirect: "follow", headers: { "User-Agent": "OpportunityOS-WebsiteAudit/1.0" } });
      const html = (await response.text()).slice(0, 500_000);
      const responseTimeMs = Math.round(performance.now() - startedAt);
      const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
      const metaDescription = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim()
        ?? html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1]?.trim();
      const hasContactCta = /contato|fale conosco|agende|orçamento|solicite/i.test(html);
      const hasWhatsapp = /wa\.me|api\.whatsapp\.com|whatsapp/i.test(html);
      const needsImprovement = !response.ok || url.protocol !== "https:" || !title || !metaDescription || !hasContactCta;
      return { status: needsImprovement ? "NEEDS_IMPROVEMENT" : "GOOD", isReachable: response.ok, hasHttps: url.protocol === "https:", responseTimeMs, title, metaDescription, hasContactCta, hasWhatsapp };
    } catch {
      return { status: "UNKNOWN", isReachable: false, note: "Não foi possível verificar." };
    }
  }
}
