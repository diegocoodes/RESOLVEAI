import { XMLParser, XMLValidator } from "fast-xml-parser";
import { normalizeBrazilianPhoneNumber } from "@/lib/whatsapp";

export const MAX_XML_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_XML_RECORDS = 2_000;

export type XmlLeadRecord = {
  row: number;
  name: string;
  address: string;
  phone: string;
  phoneNormalized: string;
  segment: string;
  originalSegment: string;
};

export type XmlLeadIssue = {
  row: number;
  name: string;
  segment?: string;
  reason: string;
};

export type XmlLeadParseResult = {
  records: XmlLeadRecord[];
  rejected: XmlLeadIssue[];
  total: number;
};

export class LeadXmlImportError extends Error {}

const FIELD_ALIASES = {
  name: new Set(["nome", "name", "contato", "nomecontato", "nomecliente", "cliente", "razaosocial", "nomefantasia"]),
  address: new Set(["endereco", "address", "localizacao", "logradouro", "enderecocompleto"]),
  phone: new Set(["telefone", "phone", "fone", "celular", "numero", "numerotelefone", "phonenumber", "whatsapp"]),
  segment: new Set(["segmento", "segment", "categoria", "category", "nicho", "setor", "ramo", "profissao"]),
};

function normalizeKey(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function scalarText(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") return normalizeSpace(String(value));
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const text = (value as Record<string, unknown>)["#text"];
    if (typeof text === "string" || typeof text === "number") return normalizeSpace(String(text));
  }
  return undefined;
}

function fieldValue(record: Record<string, unknown>, aliases: Set<string>) {
  for (const [key, value] of Object.entries(record)) {
    if (!aliases.has(normalizeKey(key))) continue;
    const text = scalarText(value);
    if (text) return text;
  }
  return "";
}

function looksLikeLead(record: Record<string, unknown>) {
  return Object.keys(record).some((key) => {
    const normalized = normalizeKey(key);
    return Object.values(FIELD_ALIASES).some((aliases) => aliases.has(normalized));
  });
}

function collectLeadNodes(value: unknown, target: Record<string, unknown>[]) {
  if (Array.isArray(value)) {
    for (const child of value) collectLeadNodes(child, target);
    return;
  }
  if (!value || typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  if (looksLikeLead(record)) target.push(record);
  for (const child of Object.values(record)) collectLeadNodes(child, target);
}

function titleCase(value: string) {
  const lowerWords = new Set(["da", "de", "do", "das", "dos", "e"]);
  return normalizeSpace(value.toLocaleLowerCase("pt-BR"))
    .split(" ")
    .map((word, index) => index > 0 && lowerWords.has(word) ? word : `${word.charAt(0).toLocaleUpperCase("pt-BR")}${word.slice(1)}`)
    .join(" ");
}

export function organizeLeadSegment(raw: string) {
  const normalized = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
  if (/\b(nutri|nutricionista|nutricao)\b/.test(normalized)) return "Nutrição";
  if (/\b(personal|personal trainer)\b/.test(normalized)) return "Personal Trainer";
  if (/\b(advogado|advogada|advogados|advogadas|advocacia)\b/.test(normalized)) return "Advocacia";
  return titleCase(raw);
}

function validateRecord(record: Record<string, unknown>, row: number): XmlLeadRecord | XmlLeadIssue {
  const name = fieldValue(record, FIELD_ALIASES.name);
  const address = fieldValue(record, FIELD_ALIASES.address);
  const phone = fieldValue(record, FIELD_ALIASES.phone);
  const originalSegment = fieldValue(record, FIELD_ALIASES.segment);

  const issue = (reason: string): XmlLeadIssue => ({ row, name: name || `Registro ${row}`, segment: originalSegment || undefined, reason });
  if (name.length < 2 || name.length > 160) return issue("Nome ausente ou inválido.");
  if (address.length < 3 || address.length > 300) return issue("Endereço ausente ou inválido.");
  if (originalSegment.length < 2 || originalSegment.length > 100) return issue("Segmento ausente ou inválido.");

  const phoneNormalized = normalizeBrazilianPhoneNumber(phone);
  if (!phoneNormalized) return issue("Telefone brasileiro inválido ou sem DDD.");

  return {
    row,
    name,
    address,
    phone,
    phoneNormalized,
    segment: organizeLeadSegment(originalSegment),
    originalSegment,
  };
}

export function parseLeadXml(xml: string): XmlLeadParseResult {
  if (!xml.trim()) throw new LeadXmlImportError("O arquivo XML está vazio.");
  if (Buffer.byteLength(xml, "utf8") > MAX_XML_FILE_SIZE) throw new LeadXmlImportError("O arquivo XML deve ter no máximo 5 MB.");
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new LeadXmlImportError("O XML não pode declarar DOCTYPE ou entidades externas.");

  const validation = XMLValidator.validate(xml);
  if (validation !== true) throw new LeadXmlImportError("O arquivo não contém um XML válido.");

  let parsed: unknown;
  try {
    parsed = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseTagValue: false,
      processEntities: false,
      trimValues: true,
    }).parse(xml);
  } catch {
    throw new LeadXmlImportError("Não foi possível ler a estrutura do XML.");
  }

  const nodes: Record<string, unknown>[] = [];
  collectLeadNodes(parsed, nodes);
  if (!nodes.length) throw new LeadXmlImportError("Nenhum registro com nome, endereço, telefone e segmento foi encontrado no XML.");
  if (nodes.length > MAX_XML_RECORDS) throw new LeadXmlImportError(`O arquivo ultrapassa o limite de ${MAX_XML_RECORDS} registros.`);

  const records: XmlLeadRecord[] = [];
  const rejected: XmlLeadIssue[] = [];
  nodes.forEach((node, index) => {
    const result = validateRecord(node, index + 1);
    if ("phoneNormalized" in result) records.push(result);
    else rejected.push(result);
  });

  return { records, rejected, total: nodes.length };
}
