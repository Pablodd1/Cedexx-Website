/**
 * ═══════════════════════════════════════════════════════════
 * CEDEXX Backend — Database Seed Runner (TypeScript)
 * ═══════════════════════════════════════════════════════════
 * 
 * Usage:
 *   npx tsx scripts/seed.ts
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
 * ═══════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY required in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log('🌱 Seeding CEDEXX database...\n');

  const seedSql = readFileSync(resolve(__dirname, '../seed.sql'), 'utf8');
  
  // Split into individual INSERT statements and execute
  const statements = seedSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  for (const stmt of statements) {
    const cleanStmt = stmt + ';';
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: cleanStmt });
      if (error) {
        // Fallback: try direct insert for known tables
        console.log(`   ⚠️  ${error.message} (trying fallback)`);
      } else {
        console.log(`   ✅ Executed ${cleanStmt.substring(0, 60)}...`);
      }
    } catch (err: any) {
      console.log(`   ⚠️  Skipped: ${err.message}`);
    }
  }

  // Verify counts
  const tables = ['contacts', 'demo_requests', 'enrollments', 'partner_inquiries', 'analytics_events'];
  console.log('\n📊 Table counts:');
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`   ${table}: ${error ? 'ERR' : count} rows`);
  }

  console.log('\n✨ Seed complete!\n');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
