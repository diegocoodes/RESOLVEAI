export type LeadSearchParams = { niche: string; location: string; limit: number; withoutWebsite?: boolean; hasInstagram?: boolean; hasWhatsapp?: boolean };
export type LeadResult = { name?: string; businessName: string; niche: string; city?: string; state?: string; website?: string; instagram?: string; whatsapp?: string; sourceUrl?: string };

export interface LeadProvider {
  readonly name: string;
  search(params: LeadSearchParams): Promise<LeadResult[]>;
}

export class LeadDiscoveryService {
  constructor(private readonly providers: LeadProvider[]) {}
  async search(params: LeadSearchParams) {
    const results = await Promise.all(this.providers.map((provider) => provider.search(params)));
    return results.flat();
  }
}
