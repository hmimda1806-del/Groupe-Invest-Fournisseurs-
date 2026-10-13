import { randomUUID, scryptSync, randomBytes } from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import type { Pool as PoolType, PoolClient } from "pg";
import { getConnectionString } from "@netlify/database";

const isNetlify = process.env.NETLIFY === "true" || Boolean(process.env.CONTEXT || process.env.NETLIFY_DB_URL || process.env.NETLIFY_DATABASE_URL);
const wilayas = ["Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar","Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Algiers","Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent","Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Béni Abbès","In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Meniaa"];
const categoryNames = ["Cement","Wood","Steel","Construction Equipment","Electrical","Plumbing","Finishing Materials","Aggregates","Concrete","Scaffolding","Other"];
let sqlite: import("node:sqlite").DatabaseSync | null = null;
let pool: PoolType | null = null;
let ready: Promise<void> | null = null;

async function localDb() {
  if (sqlite) return sqlite;
  const { DatabaseSync } = await import("node:sqlite");
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "suppliers.sqlite"));
  db.exec(`PRAGMA busy_timeout=30000; PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('Admin','Purchasing Department')), status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, description TEXT DEFAULT '', created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS wilayas (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT UNIQUE NOT NULL);
    CREATE TABLE IF NOT EXISTS suppliers (id TEXT PRIMARY KEY, name TEXT NOT NULL, legal_name TEXT DEFAULT '', logo_url TEXT DEFAULT '', description TEXT DEFAULT '', supplier_type TEXT DEFAULT 'Distributor', category_id TEXT REFERENCES categories(id) ON DELETE SET NULL, contact_person TEXT DEFAULT '', contact_position TEXT DEFAULT '', phone TEXT DEFAULT '', mobile TEXT DEFAULT '', email TEXT DEFAULT '', secondary_email TEXT DEFAULT '', wilaya_id TEXT REFERENCES wilayas(id) ON DELETE SET NULL, commune TEXT DEFAULT '', address TEXT DEFAULT '', postal_code TEXT DEFAULT '', website TEXT DEFAULT '', facebook TEXT DEFAULT '', linkedin TEXT DEFAULT '', instagram TEXT DEFAULT '', commercial_activity TEXT DEFAULT '', delivery_available INTEGER DEFAULT 0, minimum_order TEXT DEFAULT '', payment_conditions TEXT DEFAULT '', internal_notes TEXT DEFAULT '', previously_dealt INTEGER DEFAULT 0, status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT REFERENCES users(id) ON DELETE SET NULL);
    CREATE TABLE IF NOT EXISTS supplier_products (id TEXT PRIMARY KEY, supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE, product_name TEXT NOT NULL, category TEXT DEFAULT '', description TEXT DEFAULT '', availability TEXT DEFAULT '', created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS supplier_documents (id TEXT PRIMARY KEY, supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE, name TEXT NOT NULL, document_type TEXT DEFAULT 'Other', file_url TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL);`);
  const now = new Date().toISOString();
  const iw = db.prepare("INSERT OR IGNORE INTO wilayas(id,code,name) VALUES(?,?,?)");
  wilayas.forEach((name, i) => iw.run(String(i + 1), String(i + 1).padStart(2, "0"), name));
  const ic = db.prepare("INSERT OR IGNORE INTO categories(id,name,description,created_at) VALUES(?,?,?,?)");
  categoryNames.forEach((name) => ic.run(randomUUID(), name, "", now));
  const admin = db.prepare("SELECT id FROM users WHERE email=?").get("admin@supplier.local");
  const passwordFile = path.join(dataDir, "initial-admin-password.txt");
  if (!admin) {
    const password = process.env.INITIAL_ADMIN_PASSWORD || (fs.existsSync(passwordFile) ? fs.readFileSync(passwordFile, "utf8").trim() : randomBytes(24).toString("base64url"));
    if (!process.env.INITIAL_ADMIN_PASSWORD && !fs.existsSync(passwordFile)) fs.writeFileSync(passwordFile, `${password}\n`, { flag: "wx" });
    const salt = randomBytes(16).toString("hex"), hash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
    db.prepare("INSERT OR IGNORE INTO users(id,name,email,password_hash,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)").run(randomUUID(), "System Administrator", "admin@supplier.local", hash, "Admin", "Active", now, now);
  }
  sqlite = db;
  return db;
}

async function pgPool() {
  if (pool) return pool;
  const { Pool } = await import("pg");
  const connectionString = process.env.NETLIFY_DB_URL || process.env.NETLIFY_DATABASE_URL || getConnectionString();
  pool = new Pool({ connectionString, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
  return pool;
}

async function ensureReady() {
  if (!isNetlify) { await localDb(); return; }
  if (!ready) ready = (async () => {
    const p = await pgPool();
    const existing = await p.query("SELECT id FROM users WHERE email=$1 LIMIT 1", ["admin@supplier.local"]);
    if (!existing.rowCount && process.env.INITIAL_ADMIN_PASSWORD) {
      const salt = randomBytes(16).toString("hex"), hash = `${salt}:${scryptSync(process.env.INITIAL_ADMIN_PASSWORD, salt, 64).toString("hex")}`;
      await p.query("INSERT INTO users(id,name,email,password_hash,role,status,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,NOW(),NOW()) ON CONFLICT(email) DO NOTHING", [randomUUID(), "System Administrator", "admin@supplier.local", hash, "Admin", "Active"]);
    }
  })();
  await ready;
}

function postgresSql(sql: string) { let i = 0; return sql.replace(/\?/g, () => `$${++i}`); }

export async function row<T>(sql: string, ...params: any[]): Promise<T | undefined> {
  await ensureReady();
  if (isNetlify) return (await (await pgPool()).query(postgresSql(sql), params)).rows[0] as T | undefined;
  return (await localDb()).prepare(sql).get(...params) as T | undefined;
}
export async function rows<T>(sql: string, ...params: any[]): Promise<T[]> {
  await ensureReady();
  if (isNetlify) return (await (await pgPool()).query(postgresSql(sql), params)).rows as T[];
  return (await localDb()).prepare(sql).all(...params) as T[];
}
export async function run(sql: string, ...params: any[]) {
  await ensureReady();
  if (isNetlify) return (await (await pgPool()).query(postgresSql(sql), params)).rowCount;
  return (await localDb()).prepare(sql).run(...params);
}
export async function transaction<T>(callback: (query: (sql: string, ...params: any[]) => Promise<any>) => Promise<T>): Promise<T> {
  await ensureReady();
  if (isNetlify) {
    const client: PoolClient = await (await pgPool()).connect();
    try { await client.query("BEGIN"); const result = await callback(async (sql, ...params) => client.query(postgresSql(sql), params)); await client.query("COMMIT"); return result; }
    catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  }
  const db = await localDb(); db.exec("BEGIN");
  try { const result = await callback(async (sql, ...params) => db.prepare(sql).run(...params)); db.exec("COMMIT"); return result; }
  catch (error) { db.exec("ROLLBACK"); throw error; }
}

export { randomUUID };
