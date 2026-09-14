CREATE TABLE IF NOT EXISTS products (
  id           TEXT PRIMARY KEY,
  category     TEXT NOT NULL,
  title_uz     TEXT NOT NULL,
  title_ru     TEXT NOT NULL,
  price        INTEGER NOT NULL,
  old_price    INTEGER,
  currency     TEXT NOT NULL DEFAULT 'UZS',
  description_uz TEXT,
  description_ru TEXT,
  sizes        TEXT[] NOT NULL DEFAULT '{}',
  colors       TEXT[] NOT NULL DEFAULT '{}',
  tags         TEXT[] NOT NULL DEFAULT '{}',
  images       TEXT[] NOT NULL DEFAULT '{}',
  rating       SMALLINT NOT NULL DEFAULT 5,
  in_stock     BOOLEAN NOT NULL DEFAULT TRUE,
  featured     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products (featured);

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  phone         TEXT UNIQUE NOT NULL,
  name          TEXT,
  password_hash TEXT,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE TABLE IF NOT EXISTS sms_codes (
  phone       TEXT PRIMARY KEY,
  code        TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address       TEXT,
  city          TEXT,
  delivery_fee  INTEGER NOT NULL DEFAULT 0,
  subtotal      INTEGER NOT NULL,
  total         INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new',
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id           BIGSERIAL PRIMARY KEY,
  order_id     BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   TEXT NOT NULL,
  title        TEXT NOT NULL,
  price        INTEGER NOT NULL,
  qty          INTEGER NOT NULL,
  size         TEXT,
  color        TEXT,
  image        TEXT
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);
