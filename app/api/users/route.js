import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const supabaseUserId = searchParams.get('supabaseUserId');

    // Fetch the user from MongoDB
    const user = await User.findOne({ supabaseUserId });
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ message: 'Failed to fetch user', error: error.message }, { status: 500 });
  }
}
