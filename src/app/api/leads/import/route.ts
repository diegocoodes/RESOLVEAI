import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db/prisma";
import { normalizeBrazilianPhoneNumber } from "@/lib/whatsapp";
import {
  LeadSpreadsheetImportError,
  MAX_SPREADSHEET_FILE_SIZE,
  parseLeadSpreadsheet,
  type SpreadsheetLeadIssue,
  type SpreadsheetLeadRecord,
} from "@/services/lead-spreadsheet-import.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ImportAction = "preview" | "import";

function normalizeText(value?: string | null) {
  return value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/\s+/g, " ").trim() || "";
}

function nameAddressKey(name?: string | null, address?: string | null) {
  const normalizedName = normalizeText(name);
  const normalizedAddress = normalizeText(address);
  return normalizedName && normalizedAddress ? `${normalizedName}|${normalizedAddress}` : "";
}

async function classifyRecords(userId: string, records: SpreadsheetLeadRecord[]) {
  const existing = await getPrisma().lead.findMany({
    where: { userId },
    select: { name: true, businessName: true, address: true, phone: true, whatsapp: true },
  });
  const existingPhones = new Set(existing.flatMap((lead) => [normalizeBrazilianPhoneNumber(lead.phone), normalizeBrazilianPhoneNumber(lead.whatsapp)]).filter((phone): phone is string => Boolean(phone)));
  const existingNames = new Set(existing.map((lead) => nameAddressKey(lead.businessName ?? lead.name, lead.address)).filter(Boolean));
  const filePhones = new Set<string>();
  const fileNames = new Set<string>();
  const ready: SpreadsheetLeadRecord[] = [];
  const duplicates: SpreadsheetLeadIssue[] = [];

  for (const record of records) {
    const recordNameKey = nameAddressKey(record.name, record.address);
    let reason = "";
    if (existingPhones.has(record.phoneNormalized)) reason = "Telefone já cadastrado nos leads.";
    else if (filePhones.has(record.phoneNormalized)) reason = "Telefone repetido dentro da planilha XLS.";
    else if (existingNames.has(recordNameKey)) reason = "Nome e endereço já cadastrados nos leads.";
    else if (fileNames.has(recordNameKey)) reason = "Nome e endereço repetidos dentro da planilha XLS.";

    if (reason) {
      duplicates.push({ row: record.row, sheet: record.sheet, name: record.name, segment: record.segment, reason });
      continue;
    }

    filePhones.add(record.phoneNormalized);
    fileNames.add(recordNameKey);
    ready.push(record);
  }

  ready.sort((a, b) => a.segment.localeCompare(b.segment, "pt-BR") || a.name.localeCompare(b.name, "pt-BR"));
  return { ready, duplicates };
}

function segmentSummary(records: SpreadsheetLeadRecord[]) {
  const totals = new Map<string, number>();
  for (const record of records) totals.set(record.segment, (totals.get(record.segment) ?? 0) + 1);
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b, "pt-BR")).map(([name, count]) => ({ name, count }));
}

async function readUpload(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const action = form.get("action") === "import" ? "import" : "preview";
  if (!(file instanceof File)) throw new LeadSpreadsheetImportError("Anexe uma planilha XLS.");
  if (!file.name.toLocaleLowerCase("pt-BR").endsWith(".xls")) throw new LeadSpreadsheetImportError("O arquivo precisa ter a extensão .xls.");
  if (!file.size || file.size > MAX_SPREADSHEET_FILE_SIZE) throw new LeadSpreadsheetImportError("A planilha XLS deve ter entre 1 byte e 5 MB.");
  return { action: action as ImportAction, file, parsed: parseLeadSpreadsheet(await file.arrayBuffer()) };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const { action, file, parsed } = await readUpload(request);
    const { ready, duplicates } = await classifyRecords(session.user.id, parsed.records);
    const segments = segmentSummary(ready);

    if (action === "preview") {
      return NextResponse.json({
        fileName: file.name,
        total: parsed.total,
        ready: ready.length,
        duplicateCount: duplicates.length,
        rejectedCount: parsed.rejected.length,
        segments,
        records: ready,
        duplicates,
        rejected: parsed.rejected,
      });
    }

    if (!ready.length) return NextResponse.json({ error: "Não há registros novos e válidos para importar." }, { status: 409 });

    const result = await getPrisma().lead.createMany({
      data: ready.map((record) => ({
        userId: session.user.id,
        name: record.name,
        businessName: record.name,
        niche: record.segment,
        address: record.address,
        phone: record.phoneNormalized,
        source: "IMPORT" as const,
        websiteStatus: "UNKNOWN" as const,
        score: 10,
        contactAllowed: true,
        duplicateKey: `phone:${record.phoneNormalized}`,
        notes: record.segmentSource === "file"
          ? `Importado da planilha XLS ${file.name.slice(0, 180)}. Aba: ${record.sheet}. Segmento original: ${record.originalSegment}.`
          : `Importado da planilha XLS ${file.name.slice(0, 180)}. Aba: ${record.sheet}. Segmento identificado pelo nome do contato.`,
      })),
    });

    return NextResponse.json({
      imported: result.count,
      duplicateCount: duplicates.length,
      rejectedCount: parsed.rejected.length,
      segments,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof LeadSpreadsheetImportError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("lead.xls-import.failed", error);
    return NextResponse.json({ error: "Não foi possível processar a planilha XLS." }, { status: 500 });
  }
}
