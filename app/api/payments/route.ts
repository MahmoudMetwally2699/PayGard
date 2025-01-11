import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import User from '@/models/User';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { title, amount, userId } = await request.json();
    console.log('Request Body:', { title, amount, userId });

    // Validation
    if (!title || !amount || !userId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({ message: 'Invalid userId format' }, { status: 400 });
    }

    const payment = {
      title,
      amount: parseFloat(amount),
      userId: userId.toString(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await mongoose.connection.collection('payments').insertOne(payment);
    console.log('Payment created:', result);

    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...payment
    }, { status: 201 });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({
      error: 'Failed to create payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const query = userId ? { userId } : {};
    const payments = await mongoose.connection.collection('payments')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Add user email information to payments
    const enhancedPayments = await Promise.all(
      payments.map(async (payment) => {
        const user = await User.findOne({ supabaseUserId: payment.userId });
        return {
          ...payment,
          userEmail: user?.email || 'Unknown'
        };
      })
    );

    return NextResponse.json(enhancedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({
      error: 'Failed to fetch payments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
