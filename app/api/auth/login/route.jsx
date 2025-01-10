import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
  await dbConnect();
  try {
    const { email, password } = await request.json();

    // Step 1: Authenticate the user with Supabase
    const { data: supabaseUser, error: supabaseError } = await supabase.auth.signInWithPassword({ email, password });
    if (supabaseError) {
      return Response.json({ message: supabaseError.message }, { status: 400 });
    }

    // Step 2: Fetch the user's role from MongoDB
    const user = await User.findOne({ supabaseUserId: supabaseUser.user.id });
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    // Step 3: Return the user data (including role)
    return Response.json({ message: 'Login successful!', user: { ...supabaseUser, role: user.role } }, { status: 200 });
  } catch (error) {
    console.error('Login API Error:', error);
    return Response.json({ message: 'Failed to log in', error: error.message }, { status: 500 });
  }
}
