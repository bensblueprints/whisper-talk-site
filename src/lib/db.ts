import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '@/db/schema';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

declare global {
  // eslint-disable-next-line no-var
  var __sql: ReturnType<typeof postgres> | undefined;
}

const sql = global.__sql ?? postgres(url, { max: 8, idle_timeout: 20, prepare: false });
if (process.env.NODE_ENV !== 'production') global.__sql = sql;

export const db = drizzle(sql, { schema });
export { schema, sql };
