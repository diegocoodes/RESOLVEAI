import assert from "node:assert/strict";
import test from "node:test";
import { LeadXmlImportError, organizeLeadSegment, parseLeadXml } from "@/services/lead-xml-import.service";

test("organiza aliases equivalentes no mesmo segmento", () => {
  assert.equal(organizeLeadSegment("nutri"), "Nutrição");
  assert.equal(organizeLeadSegment("Nutricionista esportiva"), "Nutrição");
  assert.equal(organizeLeadSegment("personal trainer"), "Personal Trainer");
  assert.equal(organizeLeadSegment("Advogada"), "Advocacia");
});

test("lê campos em português e separa registros inválidos", () => {
  const result = parseLeadXml(`
    <leads>
      <lead>
        <nome>Diego Personal</nome>
        <endereco>Rua do Sol, 10, Recife</endereco>
        <telefone>(81) 99999-1234</telefone>
        <segmento>personal</segmento>
      </lead>
      <lead>
        <nome>Ana Lima</nome>
        <endereco>Rua da Aurora, 20, Recife</endereco>
        <telefone>número ausente</telefone>
        <segmento>nutricionista</segmento>
      </lead>
    </leads>
  `);

  assert.equal(result.total, 2);
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0]?.segment, "Personal Trainer");
  assert.equal(result.records[0]?.phoneNormalized, "5581999991234");
  assert.equal(result.rejected.length, 1);
  assert.match(result.rejected[0]?.reason ?? "", /Telefone brasileiro inválido/);
});

test("aceita aliases em inglês e atributos XML", () => {
  const result = parseLeadXml(`<customers><customer name="Clínica Vida" address="Av. Norte, 300" phone="81 3333-4455" category="Nutrição" /></customers>`);
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0]?.name, "Clínica Vida");
  assert.equal(result.records[0]?.segment, "Nutrição");
});

test("rejeita XML malformado", () => {
  assert.throws(() => parseLeadXml("<leads><lead></leads>"), LeadXmlImportError);
});

test("bloqueia declarações de entidades externas", () => {
  assert.throws(() => parseLeadXml(`<!DOCTYPE leads [<!ENTITY file SYSTEM "file:///etc/passwd">]><leads><lead><nome>&file;</nome></lead></leads>`), LeadXmlImportError);
});
