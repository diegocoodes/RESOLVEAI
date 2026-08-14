import assert from "node:assert/strict";
import test from "node:test";
import { buildOutreachMessage } from "./leads";

test("informa que conheceu a empresa pelo Google", () => {
  const message = buildOutreachMessage({
    name: "Gabriel",
    businessName: "Gabriel Personal",
    discoverySource: "Google",
    websiteStatus: "UNKNOWN",
  });

  assert.match(message, /Conheci o trabalho da Gabriel Personal pelo Google\./);
  assert.match(message, /oferecer um site para sua empresa/);
});

test("informa que conheceu a empresa pelo Instagram", () => {
  const message = buildOutreachMessage({
    name: "Marina",
    businessName: "Marina Nutricionista",
    discoverySource: "Instagram",
    websiteStatus: "UNKNOWN",
  });

  assert.match(message, /Conheci o trabalho da Marina Nutricionista pelo Instagram\./);
});
