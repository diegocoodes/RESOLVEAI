import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "@e965/xlsx";
import { LeadSpreadsheetImportError, organizeLeadSegment, parseLeadSpreadsheet } from "@/services/lead-spreadsheet-import.service";

function makeXls(rows: unknown[][]) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Clientes");
  return XLSX.write(workbook, { type: "buffer", bookType: "biff8" }) as Uint8Array;
}

test("organiza aliases equivalentes no mesmo segmento", () => {
  assert.equal(organizeLeadSegment("nutri"), "Nutrição");
  assert.equal(organizeLeadSegment("Nutricionista esportiva"), "Nutrição");
  assert.equal(organizeLeadSegment("personal trainer"), "Personal Trainer");
  assert.equal(organizeLeadSegment("Advogada"), "Advocacia");
});

test("lê XLS, encontra o cabeçalho e separa registros inválidos", () => {
  const result = parseLeadSpreadsheet(makeXls([
    ["Lista comercial"],
    ["Nome", "Endereço", "Telefone", "Segmento"],
    ["Diego Personal", "Rua do Sol, 10, Recife", "(81) 99999-1234", "personal"],
    ["Ana Lima", "Rua da Aurora, 20, Recife", "número ausente", "nutricionista"],
  ]));

  assert.equal(result.total, 2);
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0]?.segment, "Personal Trainer");
  assert.equal(result.records[0]?.phoneNormalized, "5581999991234");
  assert.equal(result.rejected.length, 1);
  assert.match(result.rejected[0]?.reason ?? "", /Telefone brasileiro inválido/);
});

test("aceita cabeçalhos equivalentes", () => {
  const result = parseLeadSpreadsheet(makeXls([
    ["Name", "Address", "Phone", "Category"],
    ["Clínica Vida", "Av. Norte, 300", "81 3333-4455", "Nutrição"],
  ]));
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0]?.name, "Clínica Vida");
  assert.equal(result.records[0]?.segment, "Nutrição");
});

test("rejeita arquivo que não é uma planilha válida", () => {
  assert.throws(() => parseLeadSpreadsheet(new TextEncoder().encode("arquivo inválido")), LeadSpreadsheetImportError);
});
