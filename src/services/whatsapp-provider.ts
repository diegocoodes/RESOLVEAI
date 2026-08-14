export type WhatsAppDraft = { phone: string; message: string };
export interface WhatsAppProvider { readonly name: string; createContactAction(draft: WhatsAppDraft): Promise<{ url?: string; externalId?: string }>; }

export class ManualWhatsAppProvider implements WhatsAppProvider {
  readonly name = "manual-wa-me";
  async createContactAction(draft: WhatsAppDraft) {
    const phone = draft.phone.replace(/\D/g, "");
    return { url: `https://wa.me/${phone}?text=${encodeURIComponent(draft.message)}` };
  }
}
