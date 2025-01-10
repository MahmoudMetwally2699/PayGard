import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import User from '@/models/User';

export async function POST(request) {
  await dbConnect();
  try {
    const { title, amount, userId } = await request.json();
    console.log('Request Body:', { title, amount, userId });

    if (!title || !amount || !userId) {
      return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return Response.json({ message: 'Invalid userId format' }, { status: 400 });
    }

    // Create new payment with string userId
    const payment = new Payment({
      title,
      amount: Number(amount),
      userId: userId.toString(),
      status: 'pending',
      createdAt: new Date()
    });

    const savedPayment = await payment.save();
    console.log('Payment created:', savedPayment);

    return Response.json(savedPayment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return Response.json({
      message: 'Failed to create payment',
      error: error.message,
      details: error.errors || {}
    }, { status: 500 });
  }
}

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let payments;
    if (userId) {
      // Use the Supabase UUID directly for querying
      payments = await Payment.find({ userId });
    } else {
      payments = await Payment.find({});
    }

    const paymentsWithUserEmails = await Promise.all(
      payments.map(async (payment) => {
        // Find user using the Supabase UUID
        const user = await User.findOne({ supabaseUserId: payment.userId });
        return {
          ...payment.toObject(),
          userEmail: user ? user.email : 'Unknown'
        };
      })
    );

    return Response.json(paymentsWithUserEmails);
  } catch (error) {
    return Response.json({ message: 'Failed to fetch payments', error: error.message }, { status: 500 });
  }
}
