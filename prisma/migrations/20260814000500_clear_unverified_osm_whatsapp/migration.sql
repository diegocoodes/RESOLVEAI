UPDATE "Lead"
SET "whatsapp" = NULL
WHERE "source" = 'OPENSTREETMAP'
  AND "phone" IS NOT NULL
  AND "whatsapp" IS NOT NULL
  AND regexp_replace("phone", '[^0-9]', '', 'g') = regexp_replace("whatsapp", '[^0-9]', '', 'g');
