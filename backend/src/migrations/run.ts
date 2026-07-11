import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import pool from '../db.js';

const migrationsDir = join(process.cwd(), 'migrations');

async function runMigrations() {
  const client = await pool.connect();

  try {
    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Get list of migration files
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const result = await client.query(
        'SELECT * FROM _migrations WHERE name = $1',
        [file]
      );

      if (result.rows.length === 0) {
        console.log(`Running migration: ${file}`);
        const sql = readFileSync(join(migrationsDir, file), 'utf8');
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (name) VALUES ($1)',
          [file]
        );
        console.log(`✓ Completed: ${file}`);
      } else {
        console.log(`⊘ Skipped: ${file} (already run)`);
      }
    }

    console.log('✓ All migrations completed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
