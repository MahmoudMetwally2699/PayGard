import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
  await dbConnect();
  try {
    const { email, password } = await request.json();

    // Step 1: Create the user in Supabase Auth
    const { data: supabaseUser, error: supabaseError } = await supabase.auth.signUp({ email, password });
    if (supabaseError) {
      console.error('Supabase Error:', supabaseError);
      return Response.json({ message: supabaseError.message }, { status: 400 });
    }

    // Step 2: Save the user in MongoDB
    const user = new User({
      email,
      supabaseUserId: supabaseUser.user.id, // Save Supabase user ID
      role: 'user', // Default role
    });
    await user.save();

    console.log('User created successfully:', user);
    return Response.json({ message: 'User created successfully!', user }, { status: 201 });
  } catch (error) {
    console.error('Error in signup API:', error);
    return Response.json({ message: 'Failed to create user', error: error.message }, { status: 500 });
  }
}
