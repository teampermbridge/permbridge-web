#!/usr/bin/env node

/**
 * PermBridge Database Migration Script
 *
 * Runs the SaaS schema migration to set up or reset the database.
 * Usage: node scripts/migrate.js
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION_FILE = path.join(__dirname, '../migrations/002_add_saas_tables.sql');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  console.log('🚀 Starting PermBridge database migration...');
  console.log(`📁 Migration file: ${MIGRATION_FILE}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL}`);

  try {
    if (!fs.existsSync(MIGRATION_FILE)) {
      console.error(`❌ Migration file not found: ${MIGRATION_FILE}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(MIGRATION_FILE, 'utf-8');
    const statements = sql.split(';').filter(s => s.trim());

    console.log(`📋 Running ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;

      try {
        await pool.query(stmt);
        process.stdout.write('.');
      } catch (err) {
        // Ignore "already exists" errors - they're expected on subsequent runs
        if (
          err.message.includes('already exists') ||
          err.message.includes('does not exist')
        ) {
          process.stdout.write('·');
        } else {
          throw err;
        }
      }
    }

    console.log('\n');
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Schema created:');
    console.log('  ✓ users');
    console.log('  ✓ organizations');
    console.log('  ✓ organization_members');
    console.log('  ✓ salesforce_connections');
    console.log('  ✓ profiles');
    console.log('  ✓ permission_sets');
    console.log('  ✓ subscriptions');
    console.log('  ✓ billing_events');
    console.log('');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');

    if (error.message.includes('connect ECONNREFUSED')) {
      console.error('💡 PostgreSQL is not running. Start it with:');
      console.error('   brew services start postgresql  # macOS');
      console.error('   sudo service postgresql start   # Linux');
    } else if (error.message.includes('permission denied')) {
      console.error('💡 Check your DATABASE_URL in .env');
    }

    await pool.end();
    process.exit(1);
  }
}

runMigration();
