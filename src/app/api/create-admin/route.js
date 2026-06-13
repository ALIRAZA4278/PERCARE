import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return NextResponse.json({ error: 'ADMIN_EMAIL or ADMIN_PASSWORD not set in .env.local' }, { status: 400 });
  }

  // Check if user already exists
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('email', email)
    .single();

  if (existing) {
    if (existing.role === 'admin') {
      return NextResponse.json({ message: 'Admin account already exists and is set up correctly.' });
    }
    // Exists but wrong role — fix it
    await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', existing.id);
    return NextResponse.json({ message: 'Existing account role updated to admin.' });
  }

  // Create new auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'FluffyNest Admin', role: 'admin' },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const userId = authData.user.id;

  // Upsert profile with admin role
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    email,
    full_name: 'FluffyNest Admin',
    role: 'admin',
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Admin account created successfully. You can now log in at /admin/login.' });
}
