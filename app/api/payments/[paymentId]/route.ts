import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { sendStatusUpdateEmail } from '@/lib/emailService';
import Stripe from 'stripe';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

// Get payment details
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

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

// Create new payment
export async function POST(request: Request) {
  await dbConnect();
  try {
    const { title, amount, userId } = await request.json();

    // Create payment in MongoDB
    const payment = {
      title,
      amount: parseFloat(amount),
      userId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await mongoose.connection.collection('payments').insertOne(payment);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        paymentId: result.insertedId.toString(),
        title
      }
    });

    // Update payment with Stripe ID
    await mongoose.connection.collection('payments').updateOne(
      { _id: result.insertedId },
      {
        $set: {
          stripePaymentIntentId: paymentIntent.id
        }
      }
    );

    return NextResponse.json({
      _id: result.insertedId.toString(),
      clientSecret: paymentIntent.client_secret,
      ...payment
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}

// Update payment status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> | { paymentId: string } }
) {
  try {
    const { paymentId } = await params;
    const { status } = await request.json();
    await dbConnect();

    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(paymentId);
    } catch (error) {
      console.error('Invalid ObjectId:', paymentId, error);
      return NextResponse.json({
        error: 'Invalid payment ID format'
      }, { status: 400 });
    }

    const result = await mongoose.connection.collection('payments').findOneAndUpdate(
      { _id: objectId },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({
        error: 'Payment not found'
      }, { status: 404 });
    }

    // Get user email from MongoDB User model
    try {
      const user = await User.findOne({ supabaseUserId: result.userId });
      console.log('User data from MongoDB:', user);

      if (user?.email) {
        console.log('Sending email to:', user.email);
        await sendStatusUpdateEmail(
          user.email,
          result.title,
          status,
          result.amount
        );
        console.log('Email sent successfully');
      } else {
        console.log('No email found in MongoDB for user:', result.userId);
      }
    } catch (emailError) {
      console.error('Detailed email error:', emailError);
    }

    return NextResponse.json({
      message: 'Payment status updated successfully',
      payment: {
        _id: result._id,
        status
      }
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({
      error: 'Failed to update payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
