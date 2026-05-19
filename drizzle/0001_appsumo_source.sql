ALTER TABLE "licenses" ALTER COLUMN "stripe_session_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "source" text NOT NULL DEFAULT 'stripe';
--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "external_id" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "licenses_source_idx" ON "licenses" USING btree ("source");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "licenses_external_id_idx" ON "licenses" USING btree ("external_id");
