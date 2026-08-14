import assert from "node:assert/strict";
import test from "node:test";
import { createWhatsAppUrl, normalizeWhatsAppNumber } from "./whatsapp";

test("normaliza telefone brasileiro e cria o link do WhatsApp", () => {
  assert.equal(normalizeWhatsAppNumber("(81) 99999-1234"), "5581999991234");
  assert.equal(createWhatsAppUrl("(81) 99999-1234"), "https://wa.me/5581999991234");
});

test("mantém um número brasileiro já normalizado", () => {
  assert.equal(createWhatsAppUrl("5581999991234"), "https://wa.me/5581999991234");
});

test("não cria link para telefone inválido", () => {
  assert.equal(createWhatsAppUrl("1234"), undefined);
});
