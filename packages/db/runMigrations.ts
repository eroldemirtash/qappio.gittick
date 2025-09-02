import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' }); // .env kökten yükleniyor varsayıyorum

const conn = process.env.SUPABASE_DB_URL;
console.log('DB URL:', conn ? 'OK' : 'MISSING');
if (!conn) {
  console.error('SUPABASE_DB_URL yok. .env dosyasını kontrol et.');
  process.exit(1);
}

const client = new Client({
  connectionString: conn.includes('sslmode=') ? conn : `${conn}?sslmode=require`,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id serial primary key,
      filename text unique not null,
      executed_at timestamptz default now()
    );
  `);

  const dir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const done = await client.query('SELECT 1 FROM migrations WHERE filename=$1', [file]);
    if (done.rowCount) { console.log('Skip', file); continue; }

    const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
    console.log('Running', file);
    await client.query(sql);
    await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
    console.log('OK', file);
  }

  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });