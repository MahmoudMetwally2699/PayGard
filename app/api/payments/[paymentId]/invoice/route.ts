import { NextResponse } from 'next/server';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import User from '@/models/User';

interface Payment {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  status: string;
  createdAt: string;
}

async function getInvoice(paymentId: string) {
  await dbConnect();

  const objectId = new mongoose.Types.ObjectId(paymentId);
  const payment = await mongoose.connection.collection('payments').findOne({
    _id: objectId,
  }) as unknown as Payment;

  if (!payment) {
    throw new Error('Payment not found');
  }

  const user = await User.findOne({ supabaseUserId: payment.userId });
  if (!user) {
    throw new Error('User not found');
  }

  const pdfBuffer = await generateInvoicePDF(payment, user);
  return { pdfBuffer, payment };
}

export async function GET(
  _request: Request,
  context: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = context.params;
    const { pdfBuffer, payment } = await getInvoice(paymentId);

    // Use headers() instead of setting them directly
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${payment._id}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate invoice',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
