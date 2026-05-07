CREATE TABLE "device_events" (
	"id" text PRIMARY KEY NOT NULL,
	"license_key" text NOT NULL,
	"device_id" text NOT NULL,
	"device_name" text,
	"kind" text NOT NULL,
	"ip" text,
	"user_agent" text,
	"meta" jsonb,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "licenses" (
	"key" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_session_id" text NOT NULL,
	"stripe_payment_intent_id" text,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"active_device_id" text,
	"active_device_name" text,
	"activated_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "device_events_key_idx" ON "device_events" USING btree ("license_key");--> statement-breakpoint
CREATE INDEX "device_events_at_idx" ON "device_events" USING btree ("at");--> statement-breakpoint
CREATE INDEX "licenses_email_idx" ON "licenses" USING btree ("email");--> statement-breakpoint
CREATE INDEX "licenses_active_device_idx" ON "licenses" USING btree ("active_device_id");--> statement-breakpoint
CREATE INDEX "licenses_session_idx" ON "licenses" USING btree ("stripe_session_id");