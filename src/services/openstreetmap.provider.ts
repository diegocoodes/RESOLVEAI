import type { LeadProvider, LeadResult, LeadSearchParams } from "@/services/lead-provider";

type NominatimPlace = {
  osm_type: "node" | "way" | "relation";
  osm_id: number;
  name?: string;
  display_name: string;
  namedetails?: Record<string, string>;
  extratags?: Record<string, string>;
};

const USER_AGENT = "OpportunityOS/1.0 (https://resolveai-sb87.vercel.app/privacidade)";
let nextRequestAt = 0;

async function respectRateLimit() {
  const delay = Math.max(0, nextRequestAt - Date.now());
  if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  nextRequestAt = Date.now() + 1_000;
}

function tag(tags: Record<string, string> | undefined, ...names: string[]) {
  for (const name of names) if (tags?.[name]) return tags[name];
  return undefined;
}

export class OpenStreetMapProvider implements LeadProvider {
  readonly name = "OpenStreetMap / Nominatim";
  private readonly baseUrl: string;

  constructor(baseUrl = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async search(params: LeadSearchParams): Promise<LeadResult[]> {
    await respectRateLimit();
    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set("q", `${params.niche.toLocaleLowerCase("pt-BR")}, ${params.location}, Brasil`);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("extratags", "1");
    url.searchParams.set("namedetails", "1");
    url.searchParams.set("countrycodes", "br");
    url.searchParams.set("dedupe", "1");
    url.searchParams.set("limit", "40");

    const response = await fetch(url, {
      headers: { "Accept-Language": "pt-BR,pt;q=0.9", "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
      next: { revalidate: 86_400 },
    });
    if (!response.ok) throw new Error(`NOMINATIM_REQUEST_FAILED_${response.status}`);
    const places = (await response.json()) as NominatimPlace[];

    return places.flatMap((place): LeadResult[] => {
      const businessName = place.namedetails?.name ?? place.name ?? place.display_name.split(",")[0]?.trim();
      if (!businessName) return [];
      const website = tag(place.extratags, "website", "contact:website", "url");
      if (params.withoutWebsite && website) return [];
      return [{
        externalId: `osm:${place.osm_type}:${place.osm_id}`,
        businessName,
        niche: params.niche,
        formattedAddress: place.display_name,
        phone: tag(place.extratags, "phone", "contact:phone", "mobile", "contact:mobile"),
        website,
        sourceUrl: `https://www.openstreetmap.org/${place.osm_type}/${place.osm_id}`,
        hasWebsite: Boolean(website),
      }];
    }).slice(0, params.limit);
  }
}
