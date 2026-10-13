CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Purchasing Department')),
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wilayas (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  supplier_type TEXT DEFAULT 'Distributor',
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  contact_person TEXT DEFAULT '',
  contact_position TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  mobile TEXT DEFAULT '',
  email TEXT DEFAULT '',
  secondary_email TEXT DEFAULT '',
  wilaya_id TEXT REFERENCES wilayas(id) ON DELETE SET NULL,
  commune TEXT DEFAULT '',
  address TEXT DEFAULT '',
  postal_code TEXT DEFAULT '',
  website TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  commercial_activity TEXT DEFAULT '',
  delivery_available SMALLINT NOT NULL DEFAULT 0,
  minimum_order TEXT DEFAULT '',
  payment_conditions TEXT DEFAULT '',
  internal_notes TEXT DEFAULT '',
  previously_dealt SMALLINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS supplier_products (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT DEFAULT '',
  description TEXT DEFAULT '',
  availability TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_documents (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document_type TEXT DEFAULT 'Other',
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

INSERT INTO categories(id,name,description) VALUES
 ('cat-01','Cement',''),('cat-02','Wood',''),('cat-03','Steel',''),
 ('cat-04','Construction Equipment',''),('cat-05','Electrical',''),('cat-06','Plumbing',''),
 ('cat-07','Finishing Materials',''),('cat-08','Aggregates',''),('cat-09','Concrete',''),
 ('cat-10','Scaffolding',''),('cat-11','Other','')
ON CONFLICT(name) DO NOTHING;

INSERT INTO wilayas(id,code,name) VALUES
 ('01','01','Adrar'),('02','02','Chlef'),('03','03','Laghouat'),('04','04','Oum El Bouaghi'),
 ('05','05','Batna'),('06','06','Béjaïa'),('07','07','Biskra'),('08','08','Béchar'),
 ('09','09','Blida'),('10','10','Bouira'),('11','11','Tamanrasset'),('12','12','Tébessa'),
 ('13','13','Tlemcen'),('14','14','Tiaret'),('15','15','Tizi Ouzou'),('16','16','Algiers'),
 ('17','17','Djelfa'),('18','18','Jijel'),('19','19','Sétif'),('20','20','Saïda'),
 ('21','21','Skikda'),('22','22','Sidi Bel Abbès'),('23','23','Annaba'),('24','24','Guelma'),
 ('25','25','Constantine'),('26','26','Médéa'),('27','27','Mostaganem'),('28','28','M''Sila'),
 ('29','29','Mascara'),('30','30','Ouargla'),('31','31','Oran'),('32','32','El Bayadh'),
 ('33','33','Illizi'),('34','34','Bordj Bou Arréridj'),('35','35','Boumerdès'),('36','36','El Tarf'),
 ('37','37','Tindouf'),('38','38','Tissemsilt'),('39','39','El Oued'),('40','40','Khenchela'),
 ('41','41','Souk Ahras'),('42','42','Tipaza'),('43','43','Mila'),('44','44','Aïn Defla'),
 ('45','45','Naâma'),('46','46','Aïn Témouchent'),('47','47','Ghardaïa'),('48','48','Relizane'),
 ('49','49','Timimoun'),('50','50','Bordj Badji Mokhtar'),('51','51','Ouled Djellal'),('52','52','Béni Abbès'),
 ('53','53','In Salah'),('54','54','In Guezzam'),('55','55','Touggourt'),('56','56','Djanet'),
 ('57','57','El M''Ghair'),('58','58','El Meniaa')
ON CONFLICT(code) DO NOTHING;
