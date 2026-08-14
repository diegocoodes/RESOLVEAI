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
type SegmentRule = {
  aliases: string[];
  resultNiche: string;
  filters: TagCondition[];
};

const SEGMENT_RULES: SegmentRule[] = [
  { aliases: ["personal trainer", "personal training", "personal"], resultNiche: "Personal Trainer", filters: [{ office: "personal_trainer" }, { craft: "personal_trainer" }] },
  { aliases: ["nutri", "nutricionista", "nutrição", "nutricao"], resultNiche: "Nutricionista", filters: [{ healthcare: "dietitian" }, { healthcare: "nutrition_counselling" }] },
  { aliases: ["psicólogo", "psicologo", "psicóloga", "psicologa"], resultNiche: "Psicologia", filters: [{ healthcare: "psychotherapist" }, { healthcare: "psychologist" }, { office: "psychotherapist" }] },
  { aliases: ["fisioterapeuta", "fisioterapia"], resultNiche: "Fisioterapia", filters: [{ healthcare: "physiotherapist" }] },
  { aliases: ["dentista", "odontologia"], resultNiche: "Odontologia", filters: [{ amenity: "dentist" }, { healthcare: "dentist" }] },
  { aliases: ["advogado", "advogada", "advocacia"], resultNiche: "Advocacia", filters: [{ office: "lawyer" }] },
  { aliases: ["contador", "contadora", "contabilidade"], resultNiche: "Contabilidade", filters: [{ office: "accountant" }, { office: "tax_advisor" }] },
  { aliases: ["corretor", "corretora", "imobiliária", "imobiliaria"], resultNiche: "Imobiliária", filters: [{ office: "estate_agent" }] },
  { aliases: ["barbearia", "barbeiro"], resultNiche: "Barbearia", filters: [{ shop: "hairdresser", hairdresser: "barber" }, { shop: "barber" }] },
  { aliases: ["salão", "salao", "cabeleireiro"], resultNiche: "Salão de beleza", filters: [{ shop: "hairdresser" }] },
  { aliases: ["estética", "estetica"], resultNiche: "Estética", filters: [{ shop: "beauty" }, { beauty: "aesthetics" }] },
  { aliases: ["academia", "fitness", "crossfit"], resultNiche: "Academia / Fitness", filters: [{ leisure: "fitness_centre" }, { leisure: "sports_centre", sport: "fitness" }] },
  { aliases: ["clínica", "clinica"], resultNiche: "Clínica", filters: [{ amenity: "clinic" }, { healthcare: "clinic" }] },
  { aliases: ["restaurante"], resultNiche: "Restaurante", filters: [{ amenity: "restaurant" }] },
  { aliases: ["oficina", "mecânico", "mecanico"], resultNiche: "Oficina mecânica", filters: [{ shop: "car_repair" }, { craft: "car_repair" }] },
  { aliases: ["assistência técnica", "assistencia tecnica"], resultNiche: "Assistência técnica", filters: [{ shop: "electronics_repair" }, { craft: "electronics_repair" }, { shop: "electronics", repair: "yes" }, { shop: "computer", repair: "yes" }, { shop: "mobile_phone", repair: "yes" }] },
  { aliases: ["fotógrafo", "fotografo", "fotografia"], resultNiche: "Fotografia", filters: [{ craft: "photographer" }, { shop: "photo" }] },
];

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

function nameSelector(value: string) {
  const escapedTokens = value.trim().split(/[^\p{L}\p{N}]+/u).filter((token) => token.length > 1).map((token) => ({
    normalized: normalize(token),
    escaped: token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  }));
  if (!escapedTokens.length) return `nwr["name"~${quoteOverpass(value.trim())},i];`;
  const filters = escapedTokens.map(({ normalized, escaped }) => {
    const suffix = normalized === "nutri" ? "" : "s?([^[:alnum:]]|$)";
    return `["name"~${quoteOverpass(`(^|[^[:alnum:]])${escaped}${suffix}`)},i]`;
  }).join("");
  return `nwr${filters};`;
}

export function buildOverpassQuery(niche: string, bbox: [number, number, number, number]) {
  return `[out:json][timeout:25][bbox:${bbox.join(",")}];(${nameSelector(niche)});out center tags 200;`;
}

function tag(tags: Record<string, string>, ...names: string[]) {
  for (const name of names) if (tags[name]) return tags[name];
  return undefined;
}

function nameMatches(name: string, niche: string) {
  const nameTokens = tokens(name);
  const queryTokens = tokens(niche);
  return queryTokens.length > 0 && queryTokens.every((queryToken) => nameTokens.some((nameToken) => queryToken === "nutri"
    ? nameToken.startsWith(queryToken)
    : nameToken === queryToken || nameToken === `${queryToken}s`));
}

function conditionMatches(tags: Record<string, string>, conditions: TagCondition) {
  return Object.entries(conditions).every(([key, value]) => tags[key]?.toLocaleLowerCase("pt-BR") === value);
}

function isClearlyNotAnIndividualProfessional(tags: Record<string, string>, name: string, rule?: SegmentRule) {
  if (["school", "college", "university", "courthouse", "townhall", "police", "library"].includes(tags.amenity ?? "")) return true;
  if (tags.office === "government" || tags.government) return true;

  if (rule?.resultNiche === "Personal Trainer") {
    const nameTokens = new Set(tokens(name));
    if (["fitness_centre", "sports_centre", "stadium", "sports_hall"].includes(tags.leisure ?? "")) return true;
    if (["academia", "studio", "estudio", "fitness", "crossfit"].some((token) => nameTokens.has(token))) return true;
  }

  if (rule?.resultNiche === "Nutricionista" && tags.shop && !rule.filters.some((filter) => conditionMatches(tags, filter))) return true;
  return false;
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
      if (!nameMatches(businessName, params.niche)) return [];
      if (isClearlyNotAnIndividualProfessional(tags, businessName, rule)) return [];
      const professionalTag = rule?.filters.some((filter) => conditionMatches(tags, filter)) ?? false;

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

      return [{
        externalId,
        businessName,
        niche: rule?.resultNiche ?? params.niche,
        formattedAddress,
        phone,
        website,
        sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
        hasWebsite: Boolean(website),
        matchType: "name",
        matchLabel: professionalTag ? "Nome e atuação profissional correspondem" : "Nome contém o termo pesquisado",
        relevance: 115 + (professionalTag ? 20 : 0)
          + (formattedAddress !== location.label ? 5 : 0)
          - (/^acad[ae]mia da cidade/.test(normalize(businessName)) ? 25 : 0),
      }];
    })
      .sort((a, b) => b.relevance - a.relevance || a.businessName.localeCompare(b.businessName, "pt-BR"))
      .slice(0, params.limit)
      .map(stripRelevance);
  }
}
