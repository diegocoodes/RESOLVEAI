import type { LeadProvider, LeadResult, LeadSearchParams } from "@/services/lead-provider";

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  businessStatus?: string;
};

type GooglePlacesResponse = { places?: GooglePlace[]; error?: { message?: string } };

export class GooglePlacesProvider implements LeadProvider {
  readonly name = "Google Places API (New)";

  constructor(private readonly apiKey = process.env.GOOGLE_PLACES_API_KEY) {}

  async search(params: LeadSearchParams): Promise<LeadResult[]> {
    if (!this.apiKey) throw new Error("GOOGLE_PLACES_API_KEY_NOT_CONFIGURED");
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask": ["places.id", "places.displayName", "places.formattedAddress", "places.internationalPhoneNumber", "places.websiteUri", "places.googleMapsUri", "places.businessStatus"].join(","),
      },
      body: JSON.stringify({ textQuery: `${params.niche} em ${params.location}`, pageSize: Math.min(params.limit, 20), languageCode: "pt-BR", regionCode: "BR" }),
    });
    const payload = (await response.json()) as GooglePlacesResponse;
    if (!response.ok) throw new Error(payload.error?.message ?? "GOOGLE_PLACES_REQUEST_FAILED");

    return (payload.places ?? [])
      .filter((place) => place.id && place.displayName?.text && place.googleMapsUri)
      .filter((place) => place.businessStatus === "OPERATIONAL" || !place.businessStatus)
      .filter((place) => !params.withoutWebsite || !place.websiteUri)
      .map((place) => ({ placeId: place.id!, businessName: place.displayName!.text!, niche: params.niche, formattedAddress: place.formattedAddress, phone: place.internationalPhoneNumber, website: place.websiteUri, sourceUrl: place.googleMapsUri!, businessStatus: place.businessStatus, hasWebsite: Boolean(place.websiteUri) }));
  }
}
