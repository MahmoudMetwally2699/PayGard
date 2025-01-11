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

export async function GET(
  request: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;
    await dbConnect();

    console.log('Generating invoice for payment:', paymentId);

    const objectId = new mongoose.Types.ObjectId(paymentId);
    const payment = await mongoose.connection.collection('payments').findOne({
      _id: objectId
    }) as unknown as Payment;

    if (!payment) {
      console.error('Payment not found:', paymentId);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    console.log('Found payment:', payment);

    // Find user by Supabase ID
    const user = await User.findOne({ supabaseUserId: payment.userId });
    console.log('Found user:', user);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const pdfBuffer = await generateInvoicePDF(payment, user);
    console.log('PDF generated successfully');

    // Return PDF file with proper headers
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
    return NextResponse.json({
      error: 'Failed to generate invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
