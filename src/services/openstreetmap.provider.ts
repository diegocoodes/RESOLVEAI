import type { LeadProvider, LeadResult, LeadSearchParams } from "@/services/lead-provider";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

type NominatimLocation = {
  osm_type: "node" | "way" | "relation";
  osm_id: number;
  display_name: string;
  boundingbox: [string, string, string, string];
  address?: {
    country_code?: string;
    city?: string;
    town?: string;
    municipality?: string;
    village?: string;
  };
  type?: string;
};

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type TagCondition = Record<string, string>;
type SegmentFilter = { conditions: TagCondition; related?: boolean };
type SegmentRule = {
  aliases: string[];
  resultNiche: string;
  filters: SegmentFilter[];
  relatedLabel?: string;
};

const SEGMENT_RULES: SegmentRule[] = [
  {
    aliases: ["personal trainer", "personal training", "personal"],
    resultNiche: "Academia / Fitness",
    filters: [
      { conditions: { office: "personal_trainer" } },
      { conditions: { craft: "personal_trainer" } },
      { conditions: { leisure: "fitness_centre" }, related: true },
      { conditions: { leisure: "sports_centre", sport: "fitness" }, related: true },
    ],
    relatedLabel: "Academia ou estúdio relacionado a personal trainers",
  },
  { aliases: ["nutricionista", "nutrição", "nutricao"], resultNiche: "Nutricionista", filters: [{ conditions: { healthcare: "dietitian" } }, { conditions: { healthcare: "nutrition_counselling" } }] },
  { aliases: ["psicólogo", "psicologo", "psicóloga", "psicologa"], resultNiche: "Psicologia", filters: [{ conditions: { healthcare: "psychotherapist" } }, { conditions: { healthcare: "psychologist" } }, { conditions: { office: "psychotherapist" } }] },
  { aliases: ["fisioterapeuta", "fisioterapia"], resultNiche: "Fisioterapia", filters: [{ conditions: { healthcare: "physiotherapist" } }] },
  { aliases: ["dentista", "odontologia"], resultNiche: "Odontologia", filters: [{ conditions: { amenity: "dentist" } }, { conditions: { healthcare: "dentist" } }] },
  { aliases: ["advogado", "advogada", "advocacia"], resultNiche: "Advocacia", filters: [{ conditions: { office: "lawyer" } }] },
  { aliases: ["contador", "contadora", "contabilidade"], resultNiche: "Contabilidade", filters: [{ conditions: { office: "accountant" } }, { conditions: { office: "tax_advisor" } }] },
  { aliases: ["corretor", "corretora", "imobiliária", "imobiliaria"], resultNiche: "Imobiliária", filters: [{ conditions: { office: "estate_agent" } }] },
  { aliases: ["barbearia", "barbeiro"], resultNiche: "Barbearia", filters: [{ conditions: { shop: "hairdresser", hairdresser: "barber" } }, { conditions: { shop: "barber" } }] },
  { aliases: ["salão", "salao", "cabeleireiro"], resultNiche: "Salão de beleza", filters: [{ conditions: { shop: "hairdresser" } }] },
  { aliases: ["estética", "estetica"], resultNiche: "Estética", filters: [{ conditions: { shop: "beauty" } }, { conditions: { beauty: "aesthetics" } }] },
  { aliases: ["academia", "fitness", "crossfit"], resultNiche: "Academia / Fitness", filters: [{ conditions: { leisure: "fitness_centre" } }, { conditions: { leisure: "sports_centre", sport: "fitness" } }] },
  { aliases: ["clínica", "clinica"], resultNiche: "Clínica", filters: [{ conditions: { amenity: "clinic" } }, { conditions: { healthcare: "clinic" } }] },
  { aliases: ["restaurante"], resultNiche: "Restaurante", filters: [{ conditions: { amenity: "restaurant" } }] },
  { aliases: ["oficina", "mecânico", "mecanico"], resultNiche: "Oficina mecânica", filters: [{ conditions: { shop: "car_repair" } }, { conditions: { craft: "car_repair" } }] },
  { aliases: ["assistência técnica", "assistencia tecnica"], resultNiche: "Assistência técnica", filters: [{ conditions: { shop: "electronics_repair" } }, { conditions: { craft: "electronics_repair" } }, { conditions: { shop: "electronics", repair: "yes" } }, { conditions: { shop: "computer", repair: "yes" } }, { conditions: { shop: "mobile_phone", repair: "yes" } }] },
  { aliases: ["fotógrafo", "fotografo", "fotografia"], resultNiche: "Fotografia", filters: [{ conditions: { craft: "photographer" } }, { conditions: { shop: "photo" } }] },
];

const POI_KEYS = ["amenity", "office", "shop", "craft", "leisure", "healthcare", "tourism"];
const DEFAULT_OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const USER_AGENT = "DiegoCodesWorkspace/1.1 (https://diegocodes.com.br/privacidade)";
const MAX_BBOX_SPAN = 2.5;
const OVERPASS_CACHE_TTL = 5 * 60 * 1_000;
const overpassCache = new Map<string, { expiresAt: number; elements: OverpassElement[] }>();
let nextNominatimRequestAt = 0;

export class OpenStreetMapSearchError extends Error {
  constructor(readonly code: "LOCATION_NOT_FOUND" | "LOCATION_TOO_BROAD" | "NOMINATIM_FAILED" | "OVERPASS_FAILED") {
    super(code);
  }
}

async function respectNominatimRateLimit() {
  const delay = Math.max(0, nextNominatimRequestAt - Date.now());
  if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  nextNominatimRequestAt = Date.now() + 1_000;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(value: string) {
  return normalize(value).split(" ").filter((token) => token.length > 1);
}

function findSegmentRule(niche: string) {
  const nicheTokens = new Set(tokens(niche));
  return SEGMENT_RULES.find((rule) => rule.aliases.some((alias) => tokens(alias).every((token) => nicheTokens.has(token))));
}

function quoteOverpass(value: string) {
  return JSON.stringify(value);
}

function phraseRegex(value: string) {
  const escapedTokens = value.trim().split(/[^\p{L}\p{N}]+/u).filter((token) => token.length > 1).map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!escapedTokens.length) return undefined;
  return `(^|[^[:alnum:]])${escapedTokens.join("[^[:alnum:]]+")}([^[:alnum:]]|$)`;
}

function selector(conditions: TagCondition, scope: string) {
  return `nwr${Object.entries(conditions).map(([key, value]) => `[${quoteOverpass(key)}=${quoteOverpass(value)}]`).join("")}${scope};`;
}

export function buildOverpassQuery(niche: string, bbox: [number, number, number, number]) {
  const rule = findSegmentRule(niche);
  const namePattern = phraseRegex(niche);
  const scope = "";
  const selectors = rule?.filters.map((filter) => selector(filter.conditions, scope)) ?? [];

  if (!rule && namePattern) selectors.push(`nwr["name"~${quoteOverpass(namePattern)},i]${scope};`);

  return `[out:json][timeout:25][bbox:${bbox.join(",")}];(${selectors.join("")});out center tags 200;`;
}

function tag(tags: Record<string, string>, ...names: string[]) {
  for (const name of names) if (tags[name]) return tags[name];
  return undefined;
}

function conditionMatches(tags: Record<string, string>, conditions: TagCondition) {
  return Object.entries(conditions).every(([key, value]) => tags[key]?.toLocaleLowerCase("pt-BR") === value);
}

function nameMatches(name: string, niche: string, rule?: SegmentRule) {
  const nameTokens = new Set(tokens(name));
  const queryTokens = tokens(niche);
  const aliases = new Set(rule?.aliases.flatMap(tokens) ?? []);
  const distinctiveTokens = queryTokens.filter((token) => !aliases.has(token));
  const requiredTokens = distinctiveTokens.length ? distinctiveTokens : queryTokens;
  return requiredTokens.length > 0 && requiredTokens.every((token) => nameTokens.has(token));
}

function formatAddress(tags: Record<string, string>, locationLabel: string) {
  const street = tag(tags, "addr:street", "addr:place");
  const streetLine = [street, tags["addr:housenumber"]].filter(Boolean).join(", ");
  const parts = [streetLine, tags["addr:suburb"], tags["addr:city"], tags["addr:state"], tags["addr:postcode"]].filter(Boolean);
  return parts.length ? [...new Set(parts)].join(", ") : locationLabel;
}

function locationScore(place: NominatimLocation, searchedCity: string) {
  const address = place.address;
  const cityNames = [address?.city, address?.town, address?.municipality, address?.village, place.display_name.split(",")[0]].filter(Boolean);
  const exactCity = cityNames.some((name) => normalize(name ?? "") === normalize(searchedCity));
  const locationType = place.osm_type === "relation" && place.type === "administrative"
    ? 3
    : ["city", "town", "municipality"].includes(place.type ?? "")
      ? 2
      : 1;
  return (exactCity ? 10 : 0) + locationType;
}

function parseLocation(value: string) {
  const parts = value.split(/\s*(?:,|\/|\s+-\s+)\s*/).map((part) => part.trim()).filter(Boolean);
  if (normalize(parts.at(-1) ?? "") === "brasil") parts.pop();
  if (parts.length < 2) return { city: parts[0] ?? value.trim() };
  return { city: parts.slice(0, -1).join(" "), state: parts.at(-1) };
}

function stripRelevance(result: LeadResult & { relevance: number }): LeadResult {
  const clean = { ...result } as LeadResult & { relevance?: number };
  delete clean.relevance;
  return clean;
}

export class OpenStreetMapProvider implements LeadProvider {
  readonly name = "OpenStreetMap / Nominatim + Overpass";
  private readonly nominatimBaseUrl: string;
  private readonly overpassBaseUrls: string[];

  constructor(
    nominatimBaseUrl = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org",
    overpassBaseUrl = process.env.OVERPASS_BASE_URL,
  ) {
    this.nominatimBaseUrl = nominatimBaseUrl.replace(/\/$/, "");
    this.overpassBaseUrls = !overpassBaseUrl || overpassBaseUrl === DEFAULT_OVERPASS_URLS[0] ? DEFAULT_OVERPASS_URLS : [overpassBaseUrl];
  }

  private async geocode(location: string) {
    await respectNominatimRateLimit();
    const url = new URL(`${this.nominatimBaseUrl}/search`);
    const parsedLocation = parseLocation(location);
    url.searchParams.set("city", parsedLocation.city);
    if (parsedLocation.state) url.searchParams.set("state", parsedLocation.state);
    url.searchParams.set("country", "Brasil");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("countrycodes", "br");
    url.searchParams.set("dedupe", "1");
    url.searchParams.set("limit", "5");

    const response = await fetch(url, {
      headers: { "Accept-Language": "pt-BR,pt;q=0.9", "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
      next: { revalidate: 86_400 },
    });
    if (!response.ok) throw new OpenStreetMapSearchError("NOMINATIM_FAILED");
    const places = ((await response.json()) as NominatimLocation[])
      .filter((place) => place.address?.country_code === "br" && place.boundingbox?.length === 4)
      .sort((a, b) => locationScore(b, parsedLocation.city) - locationScore(a, parsedLocation.city));
    const place = places[0];
    if (!place) throw new OpenStreetMapSearchError("LOCATION_NOT_FOUND");

    const [south, north, west, east] = place.boundingbox.map(Number);
    const bbox: [number, number, number, number] = [south, west, north, east];
    if (bbox.some((coordinate) => !Number.isFinite(coordinate))) throw new OpenStreetMapSearchError("LOCATION_NOT_FOUND");
    if (bbox[2] - bbox[0] > MAX_BBOX_SPAN || bbox[3] - bbox[1] > MAX_BBOX_SPAN) throw new OpenStreetMapSearchError("LOCATION_TOO_BROAD");
    return { bbox, label: place.display_name };
  }

  async search(params: LeadSearchParams): Promise<LeadResult[]> {
    const location = await this.geocode(params.location);
    const query = buildOverpassQuery(params.niche, location.bbox);
    const cached = overpassCache.get(query);
    let elements = cached && cached.expiresAt > Date.now() ? cached.elements : undefined;
    for (const url of elements ? [] : this.overpassBaseUrls) {
      try {
        const requestUrl = new URL(url);
        requestUrl.searchParams.set("data", query);
        const response = await fetch(requestUrl, {
          headers: {
            Accept: "application/json",
            "User-Agent": USER_AGENT,
          },
          cache: "no-store",
          signal: AbortSignal.timeout(25_000),
        });
        if (!response.ok) continue;
        elements = ((await response.json()) as { elements?: OverpassElement[] }).elements ?? [];
        if (overpassCache.size >= 50) overpassCache.delete(overpassCache.keys().next().value ?? "");
        overpassCache.set(query, { expiresAt: Date.now() + OVERPASS_CACHE_TTL, elements });
        break;
      } catch {
        // Public Overpass instances can be temporarily busy; try the next configured fallback.
      }
    }
    if (!elements) throw new OpenStreetMapSearchError("OVERPASS_FAILED");
    const rule = findSegmentRule(params.niche);
    const seen = new Set<string>();

    return elements.flatMap((element): Array<LeadResult & { relevance: number }> => {
      const tags = element.tags ?? {};
      const businessName = tag(tags, "name", "brand", "operator")?.trim();
      if (!businessName) return [];
      if (!rule && !POI_KEYS.some((key) => tags[key])) return [];
      const matchedFilter = rule?.filters.find((filter) => conditionMatches(tags, filter.conditions));
      const exactName = nameMatches(businessName, params.niche, rule);
      if (!matchedFilter && !exactName) return [];

      const website = tag(tags, "website", "contact:website", "url");
      if (params.withoutWebsite && website) return [];
      const phone = normalizeWhatsAppNumber(tag(tags, "phone", "contact:phone", "mobile", "contact:mobile"));
      if (!phone) return [];
      const externalId = `osm:${element.type}:${element.id}`;
      const formattedAddress = formatAddress(tags, location.label);
      const signature = `${normalize(businessName)}|${normalize(formattedAddress)}`;
      if (seen.has(externalId) || seen.has(signature)) return [];
      seen.add(externalId);
      seen.add(signature);

      const matchType = exactName ? "name" : matchedFilter?.related ? "related" : "category";
      const matchLabel = matchType === "name"
        ? "Nome correspondente à busca"
        : matchType === "related"
          ? rule?.relatedLabel ?? "Categoria relacionada"
          : "Segmento mapeado no OpenStreetMap";

      return [{
        externalId,
        businessName,
        niche: matchType === "related" ? rule?.resultNiche ?? params.niche : params.niche,
        formattedAddress,
        phone,
        website,
        sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
        hasWebsite: Boolean(website),
        matchType,
        matchLabel,
        relevance: (matchType === "name" ? 100 : matchType === "category" ? 70 : 30)
          + 15
          + (formattedAddress !== location.label ? 5 : 0)
          - (/^acad[ae]mia da cidade/.test(normalize(businessName)) ? 25 : 0),
      }];
    })
      .sort((a, b) => b.relevance - a.relevance || a.businessName.localeCompare(b.businessName, "pt-BR"))
      .slice(0, params.limit)
      .map(stripRelevance);
  }
}
