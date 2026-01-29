/**
 * Script para ejecutar migraciones SQL en Supabase
 * Usa la función rpc para ejecutar SQL raw con service role
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runSQL(sql, description) {
  console.log(`\n⏳ ${description}...`);

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // Si exec_sql no existe, intentar método alternativo
    if (error.message.includes('function') || error.code === '42883') {
      return { needsManual: true };
    }
    console.log(`  ❌ Error: ${error.message}`);
    return { error };
  }

  console.log(`  ✅ Completado`);
  return { success: true, data };
}

async function checkAndCreateTable(tableName, createSQL) {
  // Verificar si la tabla existe intentando hacer select
  const { error } = await supabase.from(tableName).select('id').limit(1);

  if (error && error.code === '42P01') {
    // Tabla no existe
    return false;
  }

  // Tabla existe o hay otro tipo de error (RLS, etc)
  return true;
}

async function addColumnIfNotExists(table, column, columnDef) {
  const { data, error } = await supabase
    .from(table)
    .select(column)
    .limit(1);

  if (error && error.message.includes(column)) {
    // Columna no existe
    return false;
  }

  return true;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  LUUC.AI - Ejecutando Migraciones de Base de Datos');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n🔗 URL: ${supabaseUrl}\n`);

  // Verificar qué falta
  console.log('📋 Verificando estado actual...\n');

  const checks = {
    companiesTable: await checkAndCreateTable('companies'),
    companyDocumentsTable: await checkAndCreateTable('company_documents'),
    usersCompanyId: await addColumnIfNotExists('users', 'company_id'),
    usersRole: await addColumnIfNotExists('users', 'role'),
    documentsCompanyId: await addColumnIfNotExists('documents', 'company_id'),
    analysesCompanyId: await addColumnIfNotExists('analyses', 'company_id'),
  };

  console.log('Estado actual:');
  console.log(`  - Tabla companies: ${checks.companiesTable ? '✅ Existe' : '❌ No existe'}`);
  console.log(`  - Tabla company_documents: ${checks.companyDocumentsTable ? '✅ Existe' : '❌ No existe'}`);
  console.log(`  - users.company_id: ${checks.usersCompanyId ? '✅ Existe' : '❌ No existe'}`);
  console.log(`  - users.role: ${checks.usersRole ? '✅ Existe' : '❌ No existe'}`);
  console.log(`  - documents.company_id: ${checks.documentsCompanyId ? '✅ Existe' : '❌ No existe'}`);
  console.log(`  - analyses.company_id: ${checks.analysesCompanyId ? '✅ Existe' : '❌ No existe'}`);

  // Si todo está bien
  if (Object.values(checks).every(v => v === true)) {
    console.log('\n✅ Todas las migraciones ya están aplicadas!');
    return;
  }

  // Necesita migraciones manuales
  console.log('\n' + '═'.repeat(65));
  console.log('  ⚠️  SE REQUIERE ACCIÓN MANUAL');
  console.log('═'.repeat(65));
  console.log(`
Supabase no permite ejecutar DDL (CREATE TABLE, ALTER TABLE)
directamente desde la API del cliente por seguridad.

PASOS PARA COMPLETAR LA MIGRACIÓN:

1. Abre el dashboard de Supabase:
   ${supabaseUrl.replace('.supabase.co', '.supabase.com')}/sql

2. Crea una nueva consulta SQL

3. Copia y pega el contenido del archivo:
   supabase/fix-schema.sql

4. Ejecuta la consulta (botón Run o Cmd+Enter)

5. Verifica que no haya errores

6. Vuelve a ejecutar este script para confirmar:
   node scripts/run-migrations.js
`);

  // Mostrar el SQL que necesita ejecutarse
  const fs = require('fs');
  const path = require('path');
  const sqlPath = path.join(__dirname, '../supabase/fix-schema.sql');

  if (fs.existsSync(sqlPath)) {
    console.log('═'.repeat(65));
    console.log('  CONTENIDO DE fix-schema.sql (para copiar):');
    console.log('═'.repeat(65));
    console.log('\n' + fs.readFileSync(sqlPath, 'utf8'));
  }
}

main().catch(console.error);
