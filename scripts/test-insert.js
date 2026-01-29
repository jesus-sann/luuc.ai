const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function test() {
  console.log('Probando inserción en tabla companies...\n');

  const createResult = await supabase
    .from('companies')
    .insert({
      name: 'Test Company',
      user_id: '00000000-0000-0000-0000-000000000000',
      industry: 'test'
    })
    .select();

  if (createResult.error) {
    console.log('❌ Error:', createResult.error.message);
    console.log('   Código:', createResult.error.code);
    if (createResult.error.hint) {
      console.log('   Hint:', createResult.error.hint);
    }
  } else {
    console.log('✅ Insert exitoso:', createResult.data);
    // Limpiar
    await supabase.from('companies').delete().eq('id', createResult.data[0].id);
    console.log('🗑️ Registro de prueba eliminado');
  }
}

test();
