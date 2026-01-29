/**
 * Script para configurar las tablas en Supabase
 * Ejecutar con: node scripts/setup-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkTables() {
  console.log('\n📋 Verificando tablas existentes...\n');

  const tables = ['users', 'documents', 'analyses', 'templates', 'usage_logs', 'companies', 'company_documents'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error && error.code === '42P01') {
      console.log(`  ❌ ${table}: NO EXISTE`);
    } else if (error) {
      console.log(`  ⚠️ ${table}: Error - ${error.message}`);
    } else {
      console.log(`  ✅ ${table}: EXISTS`);
    }
  }
}

async function testInsert() {
  console.log('\n🧪 Probando inserción de datos de prueba...\n');

  // Probar insertar un documento
  const testDoc = {
    title: 'Test Document',
    doc_type: 'test',
    content: 'Este es un documento de prueba para verificar la conexión.',
    variables: {},
    is_custom: false,
    word_count: 10,
  };

  const { data, error } = await supabase
    .from('documents')
    .insert(testDoc)
    .select()
    .single();

  if (error) {
    if (error.code === '42P01') {
      console.log('  ❌ La tabla documents no existe - Necesitas ejecutar el schema.sql');
    } else {
      console.log(`  ⚠️ Error al insertar: ${error.message}`);
    }
  } else {
    console.log('  ✅ Inserción exitosa! ID:', data.id);

    // Eliminar el documento de prueba
    await supabase.from('documents').delete().eq('id', data.id);
    console.log('  🗑️ Documento de prueba eliminado');
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  LUUC.AI - Verificación de Base de Datos Supabase');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`\n🔗 URL: ${supabaseUrl}`);

  await checkTables();
  await testInsert();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  INSTRUCCIONES PARA CREAR LAS TABLAS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`
Si las tablas no existen, sigue estos pasos:

1. Ve a tu dashboard de Supabase:
   ${supabaseUrl.replace('.supabase.co', '.supabase.com/project')}

2. Navega a: SQL Editor > New Query

3. Copia y ejecuta el contenido de:
   - supabase/schema.sql (tablas base)
   - supabase/companies.sql (tablas de empresas)

4. Ejecuta este script de nuevo para verificar.
`);
}

main().catch(console.error);
