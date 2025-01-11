import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(request: Request) {
  try {
    const { amount, currency = 'usd', title, userId } = await request.json();
    await dbConnect();

    // First create a payment record
    const payment = {
      title,
      amount: parseFloat(amount),
      userId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await mongoose.connection.collection('payments').insertOne(payment);
    const paymentId = result.insertedId;

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        paymentId: paymentId.toString(),
        title
      }
    });

    // Update the payment record with Stripe info
    await mongoose.connection.collection('payments').updateOne(
      { _id: paymentId },
      {
        $set: {
          stripePaymentIntentId: paymentIntent.id,
          status: 'awaiting_payment',
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
