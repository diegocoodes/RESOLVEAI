const BRAZIL_AREA_CODES = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "51", "53", "54", "55",
  "61", "62", "63", "64", "65", "66", "67", "68", "69",
  "71", "73", "74", "75", "77", "79",
  "81", "82", "83", "84", "85", "86", "87", "88", "89",
  "91", "92", "93", "94", "95", "96", "97", "98", "99",
]);

export function normalizeWhatsAppNumber(raw?: string | null) {
  const firstNumber = raw?.split(/[;,/]/)[0];
  let digits = firstNumber?.replace(/\D/g, "") ?? "";
  if (!digits) return undefined;

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2);
  else if (digits.startsWith("0") && (digits.length === 11 || digits.length === 12)) digits = digits.slice(1);

  if (digits.length !== 10 && digits.length !== 11) return undefined;
  if (!BRAZIL_AREA_CODES.has(digits.slice(0, 2))) return undefined;

  const subscriber = digits.slice(2);
  const validMobile = subscriber.length === 9 && subscriber.startsWith("9");
  const validLandline = subscriber.length === 8 && /^[2-5]/.test(subscriber);
  if (!validMobile && !validLandline) return undefined;
  if (/^(\d)\1+$/.test(subscriber)) return undefined;

  return `55${digits}`;
}

export function isValidBrazilianWhatsAppNumber(raw?: string | null) {
  return Boolean(normalizeWhatsAppNumber(raw));
}

export function createWhatsAppUrl(raw?: string | null, message?: string) {
  const number = normalizeWhatsAppNumber(raw);
  if (!number) return undefined;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${query}`;
}
