UPDATE "Lead"
SET
  "whatsapp" = "phone",
  "score" = GREATEST("score", 25),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "source" = 'IMPORT'
  AND "phone" IS NOT NULL
  AND BTRIM("phone") <> ''
  AND ("whatsapp" IS NULL OR BTRIM("whatsapp") = '');
