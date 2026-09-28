import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

// Reuse one pool across hot reloads (dev) and warm serverless invocations (Vercel).
const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

const pool =
  globalForDb.pool ??
  mysql.createPool({
    uri: url,
    // TiDB Cloud only accepts TLS connections
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    connectionLimit: 5,
    enableKeepAlive: true,
  });
globalForDb.pool = pool;

export const db = drizzle(pool, { schema, mode: "default" });
