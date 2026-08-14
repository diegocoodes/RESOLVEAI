export type LeadSearchParams = { niche: string; location: string; limit: number; withoutWebsite?: boolean };
export type LeadResult = {
  externalId: string;
  businessName: string;
  niche: string;
  formattedAddress?: string;
  phone?: string;
  website?: string;
  sourceUrl: string;
  businessStatus?: string;
  hasWebsite: boolean;
  matchType?: "name" | "category" | "related";
  matchLabel?: string;
};

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
