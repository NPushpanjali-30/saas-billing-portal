-- Users Table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  password TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'Active'
);

-- Invoices Table
CREATE TABLE invoices (
  id BIGSERIAL PRIMARY KEY,
  customer TEXT,
  amount TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT now(),
  email TEXT,
  plan TEXT,
  due_date TEXT,
  payment_method TEXT,
  user_id BIGINT
);

-- Settings Table
CREATE TABLE settings (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT,
  stripe_key TEXT,
  tax_rate TEXT,
  currency TEXT,
  invoice_prefix TEXT
);


