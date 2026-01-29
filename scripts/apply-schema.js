/**
 * Script para aplicar schema usando la REST API de Supabase
 * Ejecuta SQL directamente contra PostgreSQL usando pg
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
});

// Extraer project ref del URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

async function executeSQL(sql) {
  // Usar la Management API de Supabase
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error: ${response.status} - ${text}`);
  }

  return response.json();
}

async function applyMigrations() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  LUUC.AI - Aplicando Migraciones');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const migrations = [
    {
      name: 'Crear tabla companies',
      sql: `
        CREATE TABLE IF NOT EXISTS public.companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          user_id UUID NOT NULL,
          industry VARCHAR(100),
          description TEXT,
          document_rules JSONB DEFAULT '{"style": "formal", "language": "es"}',
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Crear tabla company_documents',
      sql: `
        CREATE TABLE IF NOT EXISTS public.company_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID NOT NULL,
          title VARCHAR(500) NOT NULL,
          content TEXT NOT NULL,
          doc_type VARCHAR(100),
          category VARCHAR(50) DEFAULT 'aprobado',
          uploaded_by UUID,
          word_count INT DEFAULT 0,
          views_count INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Agregar company_id a users',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'company_id')
          THEN
            ALTER TABLE public.users ADD COLUMN company_id UUID;
          END IF;
        END $$;
      `
    },
    {
      name: 'Agregar role a users',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role')
          THEN
            ALTER TABLE public.users ADD COLUMN role VARCHAR(50) DEFAULT 'member';
          END IF;
        END $$;
      `
    },
    {
      name: 'Agregar company_id a documents',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'company_id')
          THEN
            ALTER TABLE public.documents ADD COLUMN company_id UUID;
          END IF;
        END $$;
      `
    },
    {
      name: 'Agregar company_id a analyses',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'analyses' AND column_name = 'company_id')
          THEN
            ALTER TABLE public.analyses ADD COLUMN company_id UUID;
          END IF;
        END $$;
      `
    },
  ];

  // Intentar método alternativo - insertar directamente y ver qué pasa
  console.log('Probando crear empresa de prueba...\n');

  // Primero, intentar crear la tabla si no existe usando insert
  const { error: testError } = await supabase
    .from('companies')
    .select('id')
    .limit(1);

  if (testError) {
    console.log('❌ La tabla companies no existe o no es accesible');
    console.log(`   Error: ${testError.message}\n`);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  INSTRUCCIONES PARA CREAR LAS TABLAS MANUALMENTE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('1. Abre: https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n');
    console.log('2. Copia y pega el siguiente SQL:\n');
    console.log('─'.repeat(65));

    const fs = require('fs');
    const path = require('path');
    const sqlContent = fs.readFileSync(path.join(__dirname, '../supabase/fix-schema.sql'), 'utf8');
    console.log(sqlContent);

    console.log('─'.repeat(65));
    console.log('\n3. Haz clic en "Run" para ejecutar\n');
    console.log('4. Vuelve a ejecutar: node scripts/verify-schema.js\n');
  } else {
    console.log('✅ La tabla companies existe');

    // Verificar las demás
    const { error: cdError } = await supabase.from('company_documents').select('id').limit(1);
    console.log(`${cdError ? '❌' : '✅'} Tabla company_documents: ${cdError ? 'No existe' : 'Existe'}`);

    // Verificar columnas
    const { error: ucError } = await supabase.from('users').select('company_id').limit(1);
    console.log(`${ucError?.message?.includes('company_id') ? '❌' : '✅'} users.company_id`);

    const { error: urError } = await supabase.from('users').select('role').limit(1);
    console.log(`${urError?.message?.includes('role') ? '❌' : '✅'} users.role`);

    const { error: dcError } = await supabase.from('documents').select('company_id').limit(1);
    console.log(`${dcError?.message?.includes('company_id') ? '❌' : '✅'} documents.company_id`);

    const { error: acError } = await supabase.from('analyses').select('company_id').limit(1);
    console.log(`${acError?.message?.includes('company_id') ? '❌' : '✅'} analyses.company_id`);
  }
}

applyMigrations().catch(console.error);
