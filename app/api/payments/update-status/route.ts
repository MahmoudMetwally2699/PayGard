import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(request: Request) {
  try {
    const { paymentIntentId } = await request.json();

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const { db } = await connectToDatabase();

    await db.collection('payments').updateOne(
      { stripePaymentIntentId: paymentIntentId },
      {
        $set: {
          status: paymentIntent.status === 'succeeded' ? 'completed' : 'failed',
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment status update error:', error);
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }
}
