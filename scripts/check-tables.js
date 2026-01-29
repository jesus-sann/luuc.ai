// Script para verificar tablas en Supabase
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const connectionString = `postgresql://postgres.jcznbbeevjpifjqxddrd:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function checkTables() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Conectado a Supabase\n');

    // Verificar tablas existentes
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const { rows: tables } = await client.query(tablesQuery);

    console.log('=== TABLAS EN SUPABASE ===');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    // Verificar si knowledge_base existe
    const kbExists = tables.some(t => t.table_name === 'knowledge_base');
    const kbCatExists = tables.some(t => t.table_name === 'knowledge_base_categories');

    console.log('\n=== ESTADO KNOWLEDGE BASE ===');
    console.log(`  knowledge_base: ${kbExists ? '✅ EXISTE' : '❌ NO EXISTE'}`);
    console.log(`  knowledge_base_categories: ${kbCatExists ? '✅ EXISTE' : '❌ NO EXISTE'}`);

    // Si existen, mostrar columnas
    if (kbExists) {
      const columnsQuery = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'knowledge_base' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      const { rows: columns } = await client.query(columnsQuery);
      console.log('\n  Columnas de knowledge_base:');
      columns.forEach(c => console.log(`    - ${c.column_name}: ${c.data_type}`));
    }

    // Verificar otras tablas importantes
    console.log('\n=== OTRAS TABLAS IMPORTANTES ===');
    const importantTables = ['users', 'companies', 'documents', 'analyses', 'company_documents'];
    for (const tableName of importantTables) {
      const exists = tables.some(t => t.table_name === tableName);
      console.log(`  ${tableName}: ${exists ? '✅' : '❌'}`);
    }

    // Verificar funciones RPC
    console.log('\n=== FUNCIONES RPC ===');
    const functionsQuery = `
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      ORDER BY routine_name;
    `;
    const { rows: functions } = await client.query(functionsQuery);
    functions.forEach(f => console.log(`  - ${f.routine_name}`));

    const incrementKbExists = functions.some(f => f.routine_name === 'increment_kb_usage');
    console.log(`\n  increment_kb_usage: ${incrementKbExists ? '✅ EXISTE' : '❌ NO EXISTE'}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
