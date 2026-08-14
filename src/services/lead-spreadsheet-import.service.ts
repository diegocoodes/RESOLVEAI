import * as XLSX from "@e965/xlsx";
import * as cptable from "@e965/xlsx/dist/cpexcel.full";
import { normalizeBrazilianPhoneNumber } from "@/lib/whatsapp";

XLSX.set_cptable(cptable);

export const MAX_SPREADSHEET_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_SPREADSHEET_RECORDS = 2_000;

export type SpreadsheetLeadRecord = {
  row: number;
  sheet: string;
  name: string;
  address: string;
  phone: string;
  phoneNormalized: string;
  segment: string;
  originalSegment: string;
  segmentSource: "file" | "name";
};

export type SpreadsheetLeadIssue = {
  row: number;
  sheet: string;
  name: string;
  segment?: string;
  reason: string;
};

export type SpreadsheetLeadParseResult = {
  records: SpreadsheetLeadRecord[];
  rejected: SpreadsheetLeadIssue[];
  total: number;
};

export class LeadSpreadsheetImportError extends Error {}

type FieldName = "name" | "address" | "phone" | "segment";

const FIELD_ALIASES: Record<FieldName, Set<string>> = {
  name: new Set(["nome", "name", "contato", "nomecontato", "nomedocontato", "nomecliente", "nomedocliente", "cliente", "empresa", "estabelecimento", "razaosocial", "nomefantasia", "nomedoestabelecimento"]),
  address: new Set(["endereco", "address", "localizacao", "logradouro", "rua", "enderecocompleto"]),
  phone: new Set(["telefone", "telefone1", "telefoneprincipal", "phone", "fone", "celular", "numero", "numerotelefone", "numerodetelefone", "phonenumber", "whatsapp"]),
  segment: new Set(["segmento", "segment", "categoria", "category", "nicho", "setor", "ramo", "profissao"]),
};

function normalizeKey(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]/g, "");
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function scalarText(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return normalizeSpace(String(value));
  return "";
}

function cleanCellValue(value: unknown) {
  const text = scalarText(value);
  const normalized = normalizeKey(text);
  if (["", "seminfo", "naoinformado", "naoinformada", "indisponivel", "null", "undefined"].includes(normalized)) return "";
  return text;
}

function resolveHeader(value: unknown): FieldName | undefined {
  const normalized = normalizeKey(scalarText(value));
  return (Object.keys(FIELD_ALIASES) as FieldName[]).find((field) => FIELD_ALIASES[field].has(normalized));
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

export function identifyLeadSegment(name: string, providedSegment = "") {
  if (providedSegment) return { segment: organizeLeadSegment(providedSegment), source: "file" as const };
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
  const compact = normalized.replace(/\s+/g, "");
  if (/\b(nutri|nutricionista|nutricao)\b/.test(normalized)) return { segment: "Nutrição", source: "name" as const };
  if (/\b(advogado|advogada|advogados|advogadas|advocacia)\b/.test(normalized)) return { segment: "Advocacia", source: "name" as const };

  const unrelatedPersonal = /\b(chef|hair|cabeleireir\w*|car|uniforme?s?|otica|optica|sorriso|organizer|stylist|cortina?s?|alfaiate|baby|kids|cachos|lojinha|loja|apple|care|estetic\w*|academia|academy|studio|clinica|clinic|reabilita)\b/.test(normalized);
  const mentionsPersonal = compact.includes("personal");
  if (mentionsPersonal && !unrelatedPersonal) return { segment: "Personal Trainer", source: "name" as const };
  return undefined;
}

function validateRecord(values: Record<FieldName, string>, row: number, sheet: string): SpreadsheetLeadRecord | SpreadsheetLeadIssue {
  const { name, address, phone, segment: originalSegment } = values;
  const issue = (reason: string): SpreadsheetLeadIssue => ({ row, sheet, name: name || `Registro ${row}`, segment: originalSegment || undefined, reason });
  if (name.length < 2 || name.length > 160) return issue("Nome ausente ou inválido.");
  if (address.length < 3 || address.length > 300) return issue("Endereço ausente ou inválido.");
  if (originalSegment.length > 100) return issue("Segmento inválido.");

  const identifiedSegment = identifyLeadSegment(name, originalSegment);
  if (!identifiedSegment) return issue("Segmento ausente e não identificado com segurança pelo nome.");

  const phoneNormalized = normalizeBrazilianPhoneNumber(phone);
  if (!phoneNormalized) return issue("Telefone brasileiro inválido ou sem DDD.");

  return { row, sheet, name, address, phone, phoneNormalized, segment: identifiedSegment.segment, originalSegment, segmentSource: identifiedSegment.source };
}

function findHeaderRow(rows: unknown[][]) {
  const limit = Math.min(rows.length, 20);
  for (let index = 0; index < limit; index += 1) {
    const fields = rows[index]?.map(resolveHeader) ?? [];
    if ((["name", "address", "phone"] as FieldName[]).every((field) => fields.includes(field))) return { index, fields };
  }
  return undefined;
}

export function parseLeadSpreadsheet(data: ArrayBuffer | Uint8Array): SpreadsheetLeadParseResult {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (!bytes.byteLength) throw new LeadSpreadsheetImportError("A planilha XLS está vazia.");
  if (bytes.byteLength > MAX_SPREADSHEET_FILE_SIZE) throw new LeadSpreadsheetImportError("A planilha XLS deve ter no máximo 5 MB.");

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(bytes, { type: "array", dense: true, cellFormula: false, cellHTML: false, cellNF: false, cellStyles: false, bookVBA: false });
  } catch {
    throw new LeadSpreadsheetImportError("Não foi possível ler a planilha. Confirme se ela está no formato .xls e não possui senha.");
  }

  const records: SpreadsheetLeadRecord[] = [];
  const rejected: SpreadsheetLeadIssue[] = [];
  let total = 0;
  let sheetsWithHeaders = 0;

  for (const sheetName of workbook.SheetNames.slice(0, 25)) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet?.["!ref"]) continue;
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    if (range.e.c - range.s.c + 1 > 100) throw new LeadSpreadsheetImportError(`A aba “${sheetName}” ultrapassa o limite de 100 colunas.`);
    if (range.e.r - range.s.r + 1 > 10_000) throw new LeadSpreadsheetImportError(`A aba “${sheetName}” ultrapassa o limite de 10.000 linhas.`);

    const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: "", raw: false, blankrows: true });
    const header = findHeaderRow(rows);
    if (!header) continue;
    sheetsWithHeaders += 1;

    for (let index = header.index + 1; index < rows.length; index += 1) {
      const row = rows[index] ?? [];
      if (!row.some((cell) => scalarText(cell))) continue;
      total += 1;
      if (total > MAX_SPREADSHEET_RECORDS) throw new LeadSpreadsheetImportError(`A planilha ultrapassa o limite de ${MAX_SPREADSHEET_RECORDS} registros.`);

      const values: Record<FieldName, string> = { name: "", address: "", phone: "", segment: "" };
      header.fields.forEach((field, column) => {
        if (field && !values[field]) values[field] = cleanCellValue(row[column]);
      });
      const result = validateRecord(values, range.s.r + index + 1, sheetName);
      if ("phoneNormalized" in result) records.push(result);
      else rejected.push(result);
    }
  }

  if (!sheetsWithHeaders) throw new LeadSpreadsheetImportError("Não encontramos as colunas Nome, Endereço e Telefone na planilha.");
  if (!total) throw new LeadSpreadsheetImportError("A planilha não possui contatos abaixo do cabeçalho.");
  return { records, rejected, total };
}
