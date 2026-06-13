import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req) {
  try {
    const { full_name, email, password, role, admin_role } = await req.json();

    if (!full_name || !email || !password || !role) {
      return NextResponse.json({ error: 'full_name, email, password, role are required' }, { status: 400 });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Upsert profile
    const profilePayload = { id: userId, email, full_name, role };
    if (role === 'admin' && admin_role) profilePayload.admin_role = admin_role;

    const { error: profileError } = await supabaseAdmin.from('profiles').upsert(profilePayload);

    if (profileError) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: userId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
