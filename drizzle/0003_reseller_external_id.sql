ALTER TABLE "resellers" DROP COLUMN IF EXISTS "stripe_customer_id";
--> statement-breakpoint
ALTER TABLE "resellers" DROP COLUMN IF EXISTS "stripe_session_id";
--> statement-breakpoint
ALTER TABLE "resellers" DROP COLUMN IF EXISTS "stripe_payment_intent_id";
--> statement-breakpoint
DROP INDEX IF EXISTS "resellers_session_idx";
--> statement-breakpoint
DROP INDEX IF EXISTS "resellers_pi_idx";
--> statement-breakpoint
ALTER TABLE "resellers" ADD COLUMN IF NOT EXISTS "external_id" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resellers_external_id_idx" ON "resellers" USING btree ("external_id");
