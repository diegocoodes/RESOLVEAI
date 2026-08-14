export function normalizeWhatsAppNumber(raw?: string | null) {
  const firstNumber = raw?.split(/[;,/]/)[0];
  const digits = firstNumber?.replace(/\D/g, "") ?? "";
  if (!digits) return undefined;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function createWhatsAppUrl(raw?: string | null, message?: string) {
  const number = normalizeWhatsAppNumber(raw);
  if (!number) return undefined;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${query}`;
}
