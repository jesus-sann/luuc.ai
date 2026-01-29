// Script para verificar tablas usando Supabase JS Client
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('\n=== VERIFICANDO TABLAS ===\n');

    // 1. Verificar users
    console.log('1. Tabla: users');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    if (usersError) {
      console.log('   ❌ Error:', usersError.message);
    } else {
      console.log('   ✅ Existe');
    }

    // 2. Verificar companies
    console.log('\n2. Tabla: companies');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    if (companiesError) {
      console.log('   ❌ Error:', companiesError.message);
    } else {
      console.log('   ✅ Existe');
    }

    // 3. Verificar documents
    console.log('\n3. Tabla: documents');
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
    if (documentsError) {
      console.log('   ❌ Error:', documentsError.message);
    } else {
      console.log('   ✅ Existe');
    }

    // 4. Verificar analyses
    console.log('\n4. Tabla: analyses');
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('id')
      .limit(1);
    if (analysesError) {
      console.log('   ❌ Error:', analysesError.message);
    } else {
      console.log('   ✅ Existe');
    }

    // 5. Verificar company_documents
    console.log('\n5. Tabla: company_documents');
    const { data: companyDocs, error: companyDocsError } = await supabase
      .from('company_documents')
      .select('id')
      .limit(1);
    if (companyDocsError) {
      console.log('   ❌ Error:', companyDocsError.message);
    } else {
      console.log('   ✅ Existe');
    }

    // 6. Verificar knowledge_base
    console.log('\n6. Tabla: knowledge_base');
    const { data: kb, error: kbError } = await supabase
      .from('knowledge_base')
      .select('id')
      .limit(1);
    if (kbError) {
      console.log('   ❌ Error:', kbError.message);
      console.log('   📝 NECESITAS EJECUTAR: supabase/knowledge-base.sql');
    } else {
      console.log('   ✅ Existe');
    }

    // 7. Verificar knowledge_base_categories
    console.log('\n7. Tabla: knowledge_base_categories');
    const { data: kbCat, error: kbCatError } = await supabase
      .from('knowledge_base_categories')
      .select('id')
      .limit(1);
    if (kbCatError) {
      console.log('   ❌ Error:', kbCatError.message);
      console.log('   📝 NECESITAS EJECUTAR: supabase/knowledge-base.sql');
    } else {
      console.log('   ✅ Existe');
    }

    // 8. Verificar funcion increment_kb_usage
    console.log('\n8. Funcion RPC: increment_kb_usage');
    const { error: rpcError } = await supabase.rpc('increment_kb_usage', { doc_ids: [] });
    if (rpcError && rpcError.message.includes('does not exist')) {
      console.log('   ❌ No existe');
      console.log('   📝 NECESITAS EJECUTAR: supabase/knowledge-base.sql');
    } else {
      console.log('   ✅ Existe');
    }

    console.log('\n=== RESUMEN ===');
    const kbMissing = !!kbError || !!kbCatError;
    if (kbMissing) {
      console.log('\n⚠️  ACCION REQUERIDA:');
      console.log('   1. Ve a Supabase Dashboard > SQL Editor');
      console.log('   2. Ejecuta el contenido de: supabase/knowledge-base.sql');
      console.log('   3. Vuelve a ejecutar este script para verificar');
    } else {
      console.log('\n✅ Todas las tablas de Knowledge Base estan creadas!');
    }

  } catch (error) {
    console.error('Error general:', error);
  }
}

checkTables();
