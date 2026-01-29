const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkUsers() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Verificando usuarios en public.users');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, name, company_id, role, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  if (users.length === 0) {
    console.log('⚠️  No hay usuarios en la tabla public.users');
    console.log('\nEsto puede pasar si:');
    console.log('1. Te registraste ANTES de que existiera el trigger handle_new_user');
    console.log('2. El trigger no se ejecutó correctamente');
    console.log('\nSolución: Regístrate de nuevo con otro correo o ejecuta el SQL manual');
    return;
  }

  console.log(`✅ Encontrados ${users.length} usuario(s):\n`);
  users.forEach((user, i) => {
    console.log(`${i + 1}. ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Nombre: ${user.name || '(sin nombre)'}`);
    console.log(`   Company ID: ${user.company_id || '(sin empresa)'}`);
    console.log(`   Role: ${user.role || 'member'}`);
    console.log(`   Creado: ${new Date(user.created_at).toLocaleString()}`);
    console.log('');
  });
}

checkUsers();
