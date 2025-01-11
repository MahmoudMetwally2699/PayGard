import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const segments = request.url.split('/');
    const paymentId = segments[segments.indexOf('payments') + 1];

    // Validate paymentId
    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      return NextResponse.json(
        { error: 'Invalid payment ID format' },
        { status: 400 }
      );
    }

    await dbConnect();

    const objectId = new mongoose.Types.ObjectId(paymentId);
    const payment = await mongoose.connection.collection('payments').findOne({
      _id: objectId,
    }) as unknown as Payment;

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const user = await User.findOne({ supabaseUserId: payment.userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const pdfBuffer = await generateInvoicePDF(payment, user);

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
