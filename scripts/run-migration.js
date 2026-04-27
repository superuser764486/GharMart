const fs = require('fs');
const path = require('path');
const pg = require('pg');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    const migrationFile = process.argv[2] || 'scripts/002-create-orders-tables.sql';
    const sql = fs.readFileSync(path.resolve(migrationFile), 'utf-8');

    console.log(`[v0] Running migration: ${migrationFile}`);

    // Split SQL into individual statements and execute
    const statements = sql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log(`[v0] ✓ Executed: ${statement.substring(0, 80)}...`);
      } catch (err) {
        console.error(`[v0] Error: ${err.message}`);
        if (!err.message.includes('already exists')) {
          throw err;
        }
      }
    }

    console.log('[v0] Migration completed successfully!');
  } finally {
    await client.end();
  }
}

runMigration().catch((err) => {
  console.error('[v0] Migration failed:', err.message);
  process.exit(1);
});
