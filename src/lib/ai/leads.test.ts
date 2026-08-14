import assert from "node:assert/strict";
import test from "node:test";
import { buildOutreachMessage } from "./leads";

test("gera o novo formato de abordagem pelo Google", () => {
  const message = buildOutreachMessage({
    name: "Gabriel",
    businessName: "Gabriel Personal",
    discoverySource: "Google",
    websiteStatus: "UNKNOWN",
  });

  assert.equal(message, "Oi, Gabriel! Tudo bem? 😊\n\nEncontrei seu trabalho pelo Google e achei interessante a forma como você apresenta seus serviços.\n\nTrabalho com criação de sites e gosto de ajudar profissionais a organizarem melhor sua presença online, apresentarem seus serviços e facilitarem o contato com novos clientes.\n\nPensei que poderia ser algo interessante para o seu trabalho também. Se fizer sentido para você, podemos conversar um pouquinho sobre a ideia.");
});

test("usa Instagram quando essa for a origem registrada", () => {
  const message = buildOutreachMessage({
    name: "Marina",
    businessName: "Marina Nutricionista",
    discoverySource: "Instagram",
    websiteStatus: "UNKNOWN",
  });

  assert.match(message, /Encontrei seu trabalho pelo Instagram/);
});

test("usa uma origem neutra quando Google ou Instagram não estiverem registrados", () => {
  const message = buildOutreachMessage({ name: "Diego", websiteStatus: "UNKNOWN" });

  assert.match(message, /Encontrei seu trabalho online/);
});
