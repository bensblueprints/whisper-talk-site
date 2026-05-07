import { pgTable, text, timestamp, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const licenses = pgTable(
  'licenses',
  {
    key: text('key').primaryKey(),
    email: text('email').notNull(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSessionId: text('stripe_session_id').notNull(),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull().default('usd'),
    status: text('status').notNull().default('active'),
    activeDeviceId: text('active_device_id'),
    activeDeviceName: text('active_device_name'),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    refundedAt: timestamp('refunded_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    emailIdx: index('licenses_email_idx').on(t.email),
    activeDeviceIdx: index('licenses_active_device_idx').on(t.activeDeviceId),
    sessionIdx: index('licenses_session_idx').on(t.stripeSessionId)
  })
);

export const deviceEvents = pgTable(
  'device_events',
  {
    id: text('id').primaryKey(),
    licenseKey: text('license_key').notNull(),
    deviceId: text('device_id').notNull(),
    deviceName: text('device_name'),
    kind: text('kind').notNull(),
    ip: text('ip'),
    userAgent: text('user_agent'),
    meta: jsonb('meta'),
    at: timestamp('at', { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    keyIdx: index('device_events_key_idx').on(t.licenseKey),
    atIdx: index('device_events_at_idx').on(t.at)
  })
);

export const stripeEvents = pgTable(
  'stripe_events',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    payload: jsonb('payload').notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull()
  }
);

export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;
export type DeviceEvent = typeof deviceEvents.$inferSelect;
