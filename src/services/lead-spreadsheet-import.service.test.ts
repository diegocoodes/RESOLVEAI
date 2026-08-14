import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "@e965/xlsx";
import { identifyLeadSegment, LeadSpreadsheetImportError, organizeLeadSegment, parseLeadSpreadsheet } from "@/services/lead-spreadsheet-import.service";

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

test("identifica o segmento no nome quando a planilha exportada não possui essa coluna", () => {
  const result = parseLeadSpreadsheet(makeXls([
    ["Nome", "Website", "Agendamento", "Cardápio", "Redes Sociais", "Telefone", "Email", "Endereço"],
    ["Personal Trainer Sérgio Maciel", "Sem info", "Sem info", "Sem info", "Sem info", "(81) 99612-2530", "Sem info", "Rua A, Recife"],
    ["Personal Chef Di Monteiro", "Sem info", "Sem info", "Sem info", "Sem info", "(81) 98788-0493", "Sem info", "Rua B, Recife"],
    ["Eva Personal Trainer", "Sem info", "Sem info", "Sem info", "Sem info", "Sem info", "Sem info", "Rua C, Recife"],
  ]));
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0]?.segment, "Personal Trainer");
  assert.equal(result.records[0]?.segmentSource, "name");
  assert.equal(result.rejected.length, 2);
  assert.ok(result.rejected.some((item) => item.reason.includes("Segmento ausente")));
  assert.ok(result.rejected.some((item) => item.reason.includes("Telefone brasileiro inválido")));
});

test("não confunde usos comerciais da palavra personal com personal trainer", () => {
  assert.equal(identifyLeadSegment("Personal Car PE"), undefined);
  assert.equal(identifyLeadSegment("Personal Chef Bruno"), undefined);
  assert.equal(identifyLeadSegment("Ótica Personal"), undefined);
  assert.deepEqual(identifyLeadSegment("Douglas Silva Personal"), { segment: "Personal Trainer", source: "name" });
});

test("rejeita arquivo que não é uma planilha válida", () => {
  assert.throws(() => parseLeadSpreadsheet(new TextEncoder().encode("arquivo inválido")), LeadSpreadsheetImportError);
});

test("lê exportação HTML salva com extensão XLS", () => {
  const html = `﻿<html><body><table><thead><tr><th>Nome</th><th>Website</th><th>Telefone</th><th>Endereço</th></tr></thead><tbody><tr><td>Eva Personal Trainer</td><td>Sem info</td><td>(81) 99836-3170</td><td>Rua A, Recife - PE</td></tr></tbody></table></body></html>`;
  const result = parseLeadSpreadsheet(new TextEncoder().encode(html));
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0]?.segment, "Personal Trainer");
  assert.equal(result.records[0]?.phoneNormalized, "5581998363170");
});
