import { DatabaseSync } from "node:sqlite";
import { randomUUID, scryptSync, randomBytes } from "node:crypto";
import path from "node:path";
import fs from "node:fs";

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

const wilayas = ["Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar","Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Algiers","Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent","Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Béni Abbès","In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Meniaa"];
const now = new Date().toISOString();
const insertWilaya = db.prepare("INSERT OR IGNORE INTO wilayas(id,code,name) VALUES(?,?,?)");
wilayas.forEach((name, i) => insertWilaya.run(String(i + 1), String(i + 1).padStart(2, "0"), name));
const seedCategories = ["Cement","Wood","Steel","Construction Equipment","Electrical","Plumbing","Finishing Materials","Aggregates","Concrete","Scaffolding","Other"];
const insertCategory = db.prepare("INSERT OR IGNORE INTO categories(id,name,description,created_at) VALUES(?,?,?,?)");
seedCategories.forEach((name) => insertCategory.run(randomUUID(), name, "", now));
const admin = db.prepare("SELECT id FROM users WHERE email=?").get("admin@supplier.local") as {id:string}|undefined;
if (!admin) {
  const passwordFile = path.join(dataDir, "initial-admin-password.txt");
  const password = process.env.INITIAL_ADMIN_PASSWORD || (fs.existsSync(passwordFile)
    ? fs.readFileSync(passwordFile, "utf8").trim()
    : randomBytes(24).toString("base64url"));
  if (!process.env.INITIAL_ADMIN_PASSWORD && !fs.existsSync(passwordFile)) {
    fs.writeFileSync(passwordFile, `${password}\n`, { flag: "wx" });
  }
  const salt = randomBytes(16).toString("hex");
  const hash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  db.prepare("INSERT OR IGNORE INTO users(id,name,email,password_hash,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)").run(randomUUID(), "System Administrator", "admin@supplier.local", hash, "Admin", "Active", now, now);
}

export { db, randomUUID };
export function row<T>(sql: string, ...params: any[]) { return db.prepare(sql).get(...params) as T | undefined; }
export function rows<T>(sql: string, ...params: any[]) { return db.prepare(sql).all(...params) as T[]; }
export function run(sql: string, ...params: any[]) { return db.prepare(sql).run(...params); }
