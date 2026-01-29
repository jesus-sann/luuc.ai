/**
 * Script para ejecutar SQL directamente en Supabase usando pg
 * Requiere: npm install pg
 *
 * La connection string la puedes encontrar en:
 * Supabase Dashboard > Settings > Database > Connection string > URI
 */

const fs = require('fs');
const path = require('path');

// Intentar cargar pg
let pg;
try {
  pg = require('pg');
} catch (e) {
  console.log('❌ El paquete pg no está instalado.');
  console.log('   Ejecuta: npm install pg\n');
  process.exit(1);
}

require('dotenv').config({ path: '.env.local' });

// Connection string directa a PostgreSQL
// Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ⚠️  CONFIGURACIÓN REQUERIDA');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`
Para ejecutar SQL directamente, necesitas la connection string de PostgreSQL.

PASOS:
1. Ve a: https://supabase.com/dashboard/project/jcznbbeevjpifjqxddrd/settings/database

2. En "Connection string" > "URI", copia la cadena de conexión

3. Agrega a tu .env.local:
   DATABASE_URL=postgresql://postgres:[TU_PASSWORD]@db.jcznbbeevjpifjqxddrd.supabase.co:5432/postgres

4. Ejecuta de nuevo: node scripts/execute-sql-direct.js
`);
  process.exit(1);
}

async function executeSQL() {
  const { Pool } = pg;

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  LUUC.AI - Ejecutando Migraciones SQL Directamente');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Probar conexión
    console.log('🔗 Conectando a PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Conexión exitosa!\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../supabase/fix-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⏳ Ejecutando migraciones...\n');

    // Ejecutar el SQL
    await client.query(sql);

    console.log('✅ Migraciones aplicadas correctamente!\n');

    // Verificar tablas
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📋 Tablas en la base de datos:');
    result.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });

    client.release();
    await pool.end();

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  ✅ MIGRACIONES COMPLETADAS EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

executeSQL();
