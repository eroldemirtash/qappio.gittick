import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL?.includes('sslmode=')
    ? process.env.SUPABASE_DB_URL
    : `${process.env.SUPABASE_DB_URL}?sslmode=require`,
  ssl: { rejectUnauthorized: false },
});

async function runMigrations() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id serial primary key,
      filename text unique not null,
      executed_at timestamptz default now()
    );
  `);

  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));

  for (const file of files) {
    const applied = await client.query('SELECT 1 FROM migrations WHERE filename=$1', [file]);
    if (applied.rowCount && applied.rowCount > 0) {
      console.log(`Skipping ${file}, already applied.`);
      continue;
    }

    const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
    console.log(`Running ${file}...`);
    try {
      await client.query(sql);
      await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
      console.log(`${file} applied successfully.`);
    } catch (err) {
      console.error(`Error in ${file}:`, err);
      process.exit(1);
    }
  }

  await client.end();
}

runMigrations().catch(err => {
  console.error(err);
  process.exit(1);
});