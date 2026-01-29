/**
 * Script para verificar el schema completo de Supabase
 * Ejecutar con: node scripts/verify-schema.js
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

// Columnas esperadas por tabla
const expectedSchema = {
  users: ['id', 'email', 'name', 'company', 'company_id', 'role', 'avatar_url', 'plan', 'usage_documents', 'usage_analyses', 'last_login', 'created_at', 'updated_at'],
  documents: ['id', 'user_id', 'company_id', 'title', 'doc_type', 'content', 'variables', 'is_custom', 'word_count', 'created_at', 'updated_at'],
  analyses: ['id', 'user_id', 'company_id', 'filename', 'file_path', 'file_size', 'focus_context', 'risk_score', 'summary', 'findings', 'missing_clauses', 'observations', 'created_at'],
  templates: ['id', 'user_id', 'name', 'slug', 'description', 'category', 'variables', 'system_prompt', 'is_public', 'usage_count', 'created_at', 'updated_at'],
  usage_logs: ['id', 'user_id', 'action_type', 'tokens_used', 'model_used', 'metadata', 'created_at'],
  companies: ['id', 'name', 'user_id', 'industry', 'description', 'document_rules', 'status', 'created_at', 'updated_at'],
  company_documents: ['id', 'company_id', 'title', 'content', 'doc_type', 'category', 'uploaded_by', 'word_count', 'views_count', 'created_at', 'updated_at'],
};

async function getTableColumns(tableName) {
  // Intentar obtener una fila para ver las columnas
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error) {
    if (error.code === '42P01') return { exists: false, columns: [] };
    return { exists: true, columns: [], error: error.message };
  }

  // Si hay datos, obtener las columnas del primer registro
  if (data && data.length > 0) {
    return { exists: true, columns: Object.keys(data[0]) };
  }

  // Si no hay datos, intentar insertar y ver el error para obtener info
  return { exists: true, columns: [], noData: true };
}

async function testTableOperations(tableName) {
  const results = { select: false, insert: false };

  // Test SELECT
  const { error: selectError } = await supabase
    .from(tableName)
    .select('id')
    .limit(1);
  results.select = !selectError;

  // Test INSERT (solo para tablas que no requieren FK)
  if (tableName === 'templates') {
    const { error: insertError } = await supabase
      .from(tableName)
      .insert({ name: 'test', slug: 'test-' + Date.now() })
      .select();

    if (!insertError) {
      results.insert = true;
      // Limpiar
      await supabase.from(tableName).delete().eq('slug', 'test-' + Date.now());
    }
  }

  return results;
}

async function checkCompanyIdColumns() {
  console.log('\n🔗 Verificando columna company_id en tablas relacionadas...\n');

  // Verificar documents.company_id
  const { data: docData, error: docError } = await supabase
    .from('documents')
    .select('company_id')
    .limit(1);

  if (docError && docError.message.includes('company_id')) {
    console.log('  ❌ documents.company_id: NO EXISTE');
    console.log('     → Ejecuta: ALTER TABLE documents ADD COLUMN company_id UUID REFERENCES companies(id);');
  } else {
    console.log('  ✅ documents.company_id: EXISTS');
  }

  // Verificar analyses.company_id
  const { data: analysisData, error: analysisError } = await supabase
    .from('analyses')
    .select('company_id')
    .limit(1);

  if (analysisError && analysisError.message.includes('company_id')) {
    console.log('  ❌ analyses.company_id: NO EXISTE');
    console.log('     → Ejecuta: ALTER TABLE analyses ADD COLUMN company_id UUID REFERENCES companies(id);');
  } else {
    console.log('  ✅ analyses.company_id: EXISTS');
  }

  // Verificar users.company_id y users.role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id, role')
    .limit(1);

  if (userError) {
    if (userError.message.includes('company_id')) {
      console.log('  ❌ users.company_id: NO EXISTE');
    }
    if (userError.message.includes('role')) {
      console.log('  ❌ users.role: NO EXISTE');
    }
  } else {
    console.log('  ✅ users.company_id: EXISTS');
    console.log('  ✅ users.role: EXISTS');
  }
}

async function testCompanyFlow() {
  console.log('\n🧪 Probando flujo completo de empresa...\n');

  // 1. Crear empresa de prueba
  const testCompany = {
    name: 'Empresa de Prueba',
    user_id: '00000000-0000-0000-0000-000000000000', // UUID ficticio
    industry: 'legal',
    description: 'Empresa de prueba para verificar el schema',
    status: 'active',
  };

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert(testCompany)
    .select()
    .single();

  if (companyError) {
    console.log('  ❌ Error creando empresa:', companyError.message);
    return;
  }
  console.log('  ✅ Empresa creada:', company.id);

  // 2. Crear documento de referencia
  const testDoc = {
    company_id: company.id,
    title: 'Documento de Prueba',
    content: 'Este es el contenido del documento de prueba.',
    doc_type: 'contrato',
    category: 'aprobado',
  };

  const { data: doc, error: docError } = await supabase
    .from('company_documents')
    .insert(testDoc)
    .select()
    .single();

  if (docError) {
    console.log('  ❌ Error creando documento:', docError.message);
  } else {
    console.log('  ✅ Documento de referencia creado:', doc.id);

    // Verificar word_count si existe
    if (doc.word_count !== undefined) {
      console.log('  ✅ word_count calculado:', doc.word_count);
    }
  }

  // 3. Probar document_rules JSON
  const { data: updatedCompany, error: updateError } = await supabase
    .from('companies')
    .update({
      document_rules: {
        style: 'formal',
        tone: 'profesional',
        customInstructions: 'Usar lenguaje técnico',
      },
    })
    .eq('id', company.id)
    .select()
    .single();

  if (updateError) {
    console.log('  ❌ Error actualizando document_rules:', updateError.message);
  } else {
    console.log('  ✅ document_rules actualizado correctamente');
  }

  // 4. Limpiar datos de prueba
  if (doc) {
    await supabase.from('company_documents').delete().eq('id', doc.id);
  }
  await supabase.from('companies').delete().eq('id', company.id);
  console.log('  🗑️ Datos de prueba eliminados');
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  LUUC.AI - Verificación Completa del Schema de Supabase');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n🔗 URL: ${supabaseUrl}\n`);

  // 1. Verificar existencia de tablas
  console.log('📋 Verificando tablas...\n');

  for (const [table, expectedCols] of Object.entries(expectedSchema)) {
    const result = await getTableColumns(table);

    if (!result.exists) {
      console.log(`  ❌ ${table}: NO EXISTE`);
    } else if (result.error) {
      console.log(`  ⚠️ ${table}: Error - ${result.error}`);
    } else if (result.noData) {
      console.log(`  ✅ ${table}: EXISTS (sin datos para verificar columnas)`);
    } else {
      const missingCols = expectedCols.filter(col => !result.columns.includes(col));
      const extraCols = result.columns.filter(col => !expectedCols.includes(col));

      if (missingCols.length === 0) {
        console.log(`  ✅ ${table}: EXISTS (${result.columns.length} columnas)`);
      } else {
        console.log(`  ⚠️ ${table}: Faltan columnas: ${missingCols.join(', ')}`);
      }

      if (extraCols.length > 0) {
        console.log(`     ℹ️ Columnas extra: ${extraCols.join(', ')}`);
      }
    }
  }

  // 2. Verificar columnas company_id
  await checkCompanyIdColumns();

  // 3. Probar flujo completo
  await testCompanyFlow();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  Verificación completada');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
