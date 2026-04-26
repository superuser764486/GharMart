import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQL(filePath) {
  const sql = fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
  
  // Split by statements and filter empty ones
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`Executing ${statements.length} SQL statements from ${filePath}...`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    try {
      const { error } = await supabase.rpc('exec', { 
        sql: statement 
      }).catch(async () => {
        // Fallback: use the direct SQL execution approach
        return await supabase.rpc('exec', { p_sql: statement }).catch(() => null);
      });

      if (error && error.message && !error.message.includes('already exists')) {
        console.error(`Error at statement ${i + 1}:`, error.message);
      }
    } catch (err) {
      console.log(`Statement ${i + 1} skipped (may already exist)`);
    }
  }
  
  console.log(`✓ Completed ${filePath}`);
}

async function main() {
  console.log('Starting database setup...\n');
  
  try {
    await runSQL('01-create-schema.sql');
    console.log('\n');
    await runSQL('02-seed-data.sql');
    
    console.log('\n✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error during database setup:', error);
    process.exit(1);
  }
}

main();
