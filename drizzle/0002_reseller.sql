ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "reseller_id" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "licenses_reseller_idx" ON "licenses" USING btree ("reseller_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resellers" (
  "id" text PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "name" text,
  "stripe_customer_id" text,
  "stripe_session_id" text,
  "stripe_payment_intent_id" text,
  "amount_cents" integer NOT NULL,
  "currency" text NOT NULL DEFAULT 'usd',
  "access_token" text NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "refunded_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "resellers_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resellers_email_idx" ON "resellers" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resellers_session_idx" ON "resellers" USING btree ("stripe_session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resellers_pi_idx" ON "resellers" USING btree ("stripe_payment_intent_id");
